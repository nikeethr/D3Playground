import spline
import numpy as np
import matplotlib.pyplot as plt

def test_plot_cubic_spline():
	N = 10
	steps = [1.0, 0.75, 0.5, 0.25, 0.1 ,0.075, 0.05 ,0.025]
	x = list([2*i for i in range(N)])
	y = list(np.random.randn(N))
	data = [(x[i], y[i]) for i in range(N)]

	cubic_spline_solver = spline.CubicSpline(data)
	cubic_spline_solver.compute_cubic_spline_fit()

	plt.scatter(x, y, color='black', marker='x', zorder=100)
	plt.plot(x, y, color='r')

	for s in steps:
		x_interp = np.arange(x[0], x[N-1], s)
		y_interp = cubic_spline_solver.get_cubic_fit(x_interp)
		plt.plot(x_interp, y_interp, color = 'black', ls='--', lw=0.5)

	x_interp = np.arange(x[0], x[N-1], 0.001)
	y_interp = cubic_spline_solver.get_cubic_fit(x_interp)

	plt.plot(x_interp, y_interp)

	plt.show()

if __name__ == "__main__":
	test_plot_cubic_spline()	
