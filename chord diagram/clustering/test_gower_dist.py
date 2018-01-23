import gower_dist
import numpy as np
import pandas as pd

def test_gower_dist():
	d = {
		'Age': [1,2,3,4],
		'Value': ['cat','dog','plane','cat'],
		'IsAnimal': [True, True, False, True]
	}

	df = pd.DataFrame(d)
	print(np.nanmax(df.iloc[:,0].values))

	gower = gower_dist.GowerDist(df)
	gower.compute_gower_distance_matrix()
	d_mat = gower.get_d_mat()
	w_mat = gower.get_w_mat()

	print(df)
	print(df.dtypes)
	print("d =")
	print(d_mat)
	print("w =")
	print(w_mat)

if __name__ == "__main__":
	test_gower_dist()
