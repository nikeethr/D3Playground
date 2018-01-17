import collections
import numpy as np

# Example data set:
# data = [(x1,y1), (x2,y2), (x3,y3), ..., (xn, yn)]

class CubicSpline:
    def __init__(self, data):
        self.__N = len(data)
        self.__m = self.__create_variable_map(len(data) - 1)
        self.__x = list(map(lambda g : g[0], data))
        self.__y = list(map(lambda g : g[1], data))
        self.__reset_computation()

    def __reset_computation(self):
        self.__A = []
        self.__b = []
        self.__coef = []
        self.__computed = False

    def load_new_data(self, data):
        self.__m = self.__create_variable_map(len(data) - 1)
        self.__x = list(map(lambda g : g[0], data))
        self.__y = list(map(lambda g : g[1], data))
        self.__reset_computation()
    
    def compute_cubic_spline_fit(self):
        if self.__computed:
            return

        self.__convert_to_cubic_spline_linear_system()
        self.__solve_linear_system()
        self.__computed = True

    def get_cubic_fit(self, xs):
        assert(self.__computed)

        y = [0 for i in range(len(xs))]
        v = ['a', 'b', 'c', 'd']
        N = self.__N
        x = self.__x
        m = self.__m
        coef = self.__coef

        for i in range(len(xs)):
            idx = N-2
            for j in range(N):
                if xs[i] < x[j]:
                    idx = j-1
                    break
            idx = min(max(0, idx), N-2)
            p = list(map(lambda k: coef[m[k + str(idx)]], v)) # parameters
            c = self.__get_cubic_coef(xs[i]) # coefficients
            y[i] = np.dot(c, p)

        return y
        
    def get_cubic_coefficients(self):
        return self.__coef

    def __create_variable_map(self, N):
        variable_map = collections.OrderedDict()
        k = 0
        for i in range(N):
            variable_map['a' + str(i)] = k
            variable_map['b' + str(i)] = k+1
            variable_map['c' + str(i)] = k+2
            variable_map['d' + str(i)] = k+3
            k += 4

        return variable_map 

    def __get_cubic_first_derivative_coef(self, x):
        y = self.__compute_cubic_first_derivative(x)
        y.extend([-k for k in y])
        return y

    def __get_cubic_second_derivative_coef(self, x):
        y = self.__compute_cubic_second_derivative(x)
        y.extend([-k for k in y])
        return y

    def __compute_cubic_linear_system_row(self, A, b, x, y, v, m, f):
        g = f(x)
        assert(len(g) == len(v))

        row = [0 for i in range(len(m))]
        for i,k in enumerate(v):
            row[m[k]] = g[i]
        
        A.append(row)
        b.append(y)

    def __get_cubic_coef(self, x):
        return [x**3, x**2, x, 1]

    def __compute_cubic_first_derivative(self, x):
        return [3*x**2, 2*x, 1]

    def __compute_cubic_second_derivative(self, x):
        return [6*x, 2]

    def __convert_to_cubic_spline_linear_system(self):
        # renaming for easy usage
        N = self.__N
        x = self.__x
        y = self.__y
        m = self.__m
        A = []
        b = []

        for i in range(N-1):
            # Condition Set 1: Curve should pass through interval end points

            for j in [i, i+1]:
                v =  [k + str(i) for k in ['a', 'b', 'c', 'd']]
                self.__compute_cubic_linear_system_row(A, b, x[j], y[j], v, m, self.__get_cubic_coef)

            if i == N-2:
                break

            # Condition Set 2: Curve should be continuous at interval end points
            # 1st derivative
            v = [k + str(i) for k in ['a', 'b', 'c']]
            v.extend([k + str(i+1) for k in ['a', 'b', 'c']])
            self.__compute_cubic_linear_system_row(A, b, x[i+1], 0, v, m, self.__get_cubic_first_derivative_coef)

            # 2nd derivative
            v = [k + str(i) for k in ['a', 'b']]
            v.extend([k + str(i+1) for k in ['a', 'b']])
            self.__compute_cubic_linear_system_row(A, b, x[i+1], 0, v, m, self.__get_cubic_second_derivative_coef)

        # Condition Set 3: Boundaries should have second deravitive = 0
        v = [k + str(0) for k in ['a', 'b']]
        self.__compute_cubic_linear_system_row(A, b, x[0], 0, v, m, self.__compute_cubic_second_derivative)
        v = [k + str(N-2) for k in ['a', 'b']]
        self.__compute_cubic_linear_system_row(A, b, x[N-1], 0, v, m, self.__compute_cubic_second_derivative)

        self.__A = A
        self.__b = b

    def __solve_linear_system(self):
        A = np.array(self.__A)
        b = np.array(self.__b)
        coef = np.linalg.solve(A, b)
        assert(np.allclose(np.dot(A, coef), b))
        self.__coef = coef
