import numpy as np
import matplotlib.pyplot as plt
import math
from matplotlib.colors import Colormap

def stack_graphs(fs, g0):
    g_all = [g0]
    for f in fs:
        g = [g_all[-1][i] + f[i] for i,v in enumerate(f)]
        g_all.append(g)
    return g_all

# N is the number of data points
def centered_initialisation_sequence(N, fs):
    g = [0 for i in range(N)]

    for i in range(N):
        for f in fs:
            g[i] += f[i]
        g[i] *= -1/2

    return g

def zero_initialisation(N):
    return [0 for _ in range(N)] 

def variance_initialisation(N, fs):
    g = [0 for i in range(N)]

    for i in range(N):
        for k,_ in enumerate(fs):
            for l in range(k+1):
                g[i] += fs[l][i]
        g[i] *= -1/(1+N)

    return g

def weighted_wiggle_initialisation(N, x, fs):
    dg0 = [0 for i in range(N)]
    dfs = [calculate_slope(x, fs[i]) for i in range(len(fs))]
    f_sum = [0 for i in range(N)]

    for i in range(N):
        for j in range(len(fs)):
            f_sum[i] += fs[j][i]

    for i in range(1, N):
        dg = 0
        for k in range(len(dfs)):
            df_sum = 0
            for l in range(1, k):
                df_sum += dfs[l][i]
            dg += (dfs[k][i]/2 + df_sum) * fs[k][i]
        dg0[i] = -dg / f_sum[i]

    g = centered_initialisation_sequence(N, fs)

    ## rectangular numeric integration
    # (note - may have lag, but g0 is just an offset function so it shouldn't be
    # too much of an issue)
    for i in range(1, N):
        g[i] = g[i-1] + dg0[i] * (x[i] - x[i-1])
        
    return g

def calculate_slope(x, f):
    assert(len(x) == len(f))

    N =  len(f)
    df = [0 for i in range(N)]

    for i in range(1, N):
        df[i] = (f[i] - f[i-1]) / (x[i] - x[i-1])

    return df

if __name__ == "__main__":
    np.random.seed(123)
    N = 20
    M = 5
    x = range(N)

    fs = np.abs(np.random.randn(M, N))

    # g0 = centered_initialisation_sequence(N, fs)
    # g0 = zero_initialisation(N)
    # g0 = variance_initialisation(N, fs)
    g0 = weighted_wiggle_initialisation(N, x, fs)
    
    g_all = stack_graphs(fs, g0)

    cmap = plt.get_cmap('Oranges')
    num_colors = cmap.N
    clr_gap = math.floor(num_colors / M)
    clr_idx = 0

    for i in range(1,len(g_all)):
        plt.fill_between(x, g_all[i-1], g_all[i], color=cmap(clr_idx))
        clr_idx += clr_gap

    plt.show()
