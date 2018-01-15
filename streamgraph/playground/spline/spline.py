import collections
import numpy as np
import matplotlib.pyplot as plt

# Example data set:
# data = [(x1,y1), (x2,y2), (x3,y3), ..., (xn, yn)]

def create_variable_map(num_data_points):
    variable_map = collections.OrderedDict()
    k = 0
    for i in range(num_data_points):
        variable_map['a' + str(i)] = k
        variable_map['b' + str(i)] = k+1
        variable_map['c' + str(i)] = k+2
        variable_map['d' + str(i)] = k+3
        k += 4

    return variable_map 


def get_cubic_first_derivative_coef(x):
    y = compute_cubic_first_derivative(x)
    y.extend([-k for k in y])
    return y

def get_cubic_second_derivative_coef(x):
    y = compute_cubic_second_derivative(x)
    y.extend([-k for k in y])
    return y

def compute_cubic_linear_system_row(A, b, x, y, v, m, f):
    g = f(x)
    assert(len(g) == len(v))

    row = [0 for i in range(len(m))]
    for i,k in enumerate(v):
        row[m[k]] = g[i]
    
    A.append(row)
    b.append(y)

def get_cubic_coef(x):
    return [x**3, x**2, x, 1]

def compute_cubic_first_derivative(x):
    return [3*x**2, 2*x, 1]

def compute_cubic_second_derivative(x):
    return [6*x, 2]

def convert_to_cubic_spline_linear_system(data, m):
    N = len(data)   
    A = []
    b = []

    for i in range(N-1):
        # Condition Set 1: Curve should pass through interval end points
        points = [data[i], data[i+1]]

        for p in points:
            (x,y) = p
            v =  [k + str(i) for k in ['a', 'b', 'c', 'd']]
            compute_cubic_linear_system_row(A, b, x, y, v, m, get_cubic_coef)

        if i == N-2:
            break

        # Condition Set 2: Curve should be continuous at interval end points
        # 1st derivative
        v = [k + str(i) for k in ['a', 'b', 'c']]
        v.extend([k + str(i+1) for k in ['a', 'b', 'c']])
        (x,_) = data[i+1]
        compute_cubic_linear_system_row(A, b, x, 0, v, m, get_cubic_first_derivative_coef)

        # 2nd derivative
        v = [k + str(i) for k in ['a', 'b']]
        v.extend([k + str(i+1) for k in ['a', 'b']])
        compute_cubic_linear_system_row(A, b, x, 0, v, m, get_cubic_second_derivative_coef)

    # Condition Set 3: Boundaries should have second deravitive = 0
    for i in [0, N-2]:
        v = [k + str(i) for k in ['a', 'b']]
        compute_cubic_linear_system_row(A, b, x, 0, v, m, compute_cubic_second_derivative)

    return (A, b)

def solve_linear_system(A, b):
    x = np.linalg.solve(A, b)
    assert(np.allclose(np.dot(A,x), b))
    return x

# plots
def plot_cubic_interpolation(data, coef, m, interp_step = 0.01):
    # plot datum
    x = list(map(lambda x: x[0], data))
    y = list(map(lambda x: x[1], data))
    plt.scatter(x, y, marker='x', color='black', s=20)
    plt.plot(x, y, color='red')

    # plot cubic interpolation
    data_interp = []
    N = len(data)
    v = ['a', 'b', 'c', 'd']

    for i in range(N-1):
        for x_interp in np.arange(x[i], x[i+1], interp_step):
            params = list(map(lambda x: coef[m[x + str(i)]], v))
            cubic_coef = get_cubic_coef(x_interp)
            y_interp = np.dot(cubic_coef, params)
            data_interp.append((x_interp, y_interp))

    # append last data point for continuity
    data_interp.append(data[-1])

    # plot interpolation
    x_interp = list(map(lambda x: x[0], data_interp))
    y_interp = list(map(lambda x: x[1], data_interp))
    plt.plot(x_interp, y_interp)

    #### [V start] - visualise interpolation chords
    if True:
        interp_step = [1.0, 0.75, 0.5, 0.25, 0.1, 0.075, 0.05, 0.025]
        for s in interp_step:
            data_interp = []
            for i in range(N-1):
                    for x_interp in np.arange(x[i], x[i+1], s):
                        params = list(map(lambda x: coef[m[x + str(i)]], v))
                        cubic_coef = get_cubic_coef(x_interp)
                        y_interp = np.dot(cubic_coef, params)
                        data_interp.append((x_interp, y_interp))

            data_interp.append(data[-1])
            x_interp = list(map(lambda x: x[0], data_interp))
            y_interp = list(map(lambda x: x[1], data_interp))
            plt.plot(x_interp, y_interp, color='black', ls='--', lw=0.5)

    #### [V end]
    plt.show()
    
# test cases
def test_variable_map():
    N = 5
    m = create_variable_map(N-1)
    for k,v in m.items():
        print("key = {}, value = {}".format(k,v))
    print("\n")

def test_derivatives():
    x = 5
    N = 5

    m = create_variable_map(N-1)

    funcs = [
        {'dsc':'get_cubic_coef',                   'f':get_cubic_coef},
        {'dsc':'get_cubic_first_derivative_coef',  'f':get_cubic_first_derivative_coef},
        {'dsc':'get_cubic_second_derivative_coef', 'f':get_cubic_second_derivative_coef},
        {'dsc':'compute_cubic_first_derivative',   'f':compute_cubic_first_derivative},
        {'dsc':'compute_cubic_second_derivative',  'f':compute_cubic_second_derivative}
    ]

    for f in funcs:
        print("x = {}, {}(x) = {}".format(x, f['dsc'], f['f'](x)))
    print("\n")

def test_cubic_spline_linear_system():
    data = [(1,2), (2,1), (3,5), (4,3), (5,4)]
    m = create_variable_map(len(data) - 1)

    (A, b) = convert_to_cubic_spline_linear_system(data, m)
    A = np.array(A)
    b = np.array(b)
    x = solve_linear_system(A, b)

    print("A = ", A)
    print("b = ", b)
    print("x = ", x)
    print("A.shape = ", A.shape)
    print("b.shape = ", b.shape)
    print("x.shape = ", x.shape)

def test_cubic_interpolation_plot():
    N = 10
    data = list(np.random.randn(N))
    data = [(2*i,data[i]) for i in range(N)]
    # data = [(1,2), (2,1), (3,5), (4,3), (5,4)]

    m = create_variable_map(len(data) - 1)

    (A, b) = convert_to_cubic_spline_linear_system(data, m)
    A = np.array(A)
    b = np.array(b)
    coef = solve_linear_system(A, b)

    plot_cubic_interpolation(data, coef, m, 0.01)

if __name__ == "__main__":
    test_variable_map()
    test_derivatives()
    test_cubic_spline_linear_system()
    test_cubic_interpolation_plot()
    # d = loaddata();
    # (A,b) = convert_to_cubic_spline_linear_system(d);
