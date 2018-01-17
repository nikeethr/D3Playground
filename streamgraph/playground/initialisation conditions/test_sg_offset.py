import sys
import numpy as np
import matplotlib.pyplot as plt
import math
from matplotlib.colors import Colormap
from sg_offset import OffsetGenerator

sys.path.insert(0, '../spline')
import spline

def test_offset_generator(method, x, fs, M):
    offset_generator = OffsetGenerator(method, x, fs)
    g_all = offset_generator.stack_graphs()

    cmap = plt.get_cmap('Oranges')
    num_colors = cmap.N
    clr_gap = math.floor(num_colors / M)
    clr_idx = 0

    for i in range(1,len(g_all)):
        plt.fill_between(x, g_all[i-1], g_all[i], color=cmap(clr_idx))
        clr_idx += clr_gap

    plt.savefig(method + '.png', bbox_inches='tight')
    plt.clf()

if __name__ == "__main__":
    np.random.seed(123)
    N = 20
    M = 5

    methods_to_test = ['blah', 'zero', 'centered', 'variance', 'weighted_wiggle']

    x = range(N)
    fs = np.abs(np.random.randn(M, N))

    x_interp = np.arange(0, N-1, 0.001)
    fs_interp = []

    for f in fs:
        data = [(x[i], f[i]) for i in range(len(x))]
        cubic_spline = spline.CubicSpline(data)
        cubic_spline.compute_cubic_spline_fit()
        f_interp = cubic_spline.get_cubic_fit(x_interp)
        fs_interp.append(f_interp)

    for m in methods_to_test:
        test_offset_generator(m, x_interp, fs_interp, M)
