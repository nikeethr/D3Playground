import numpy as np
import pandas as pd

class GowerDist():
	def __init__(self, d):
		self.__data = d
		self.__d_mat = []
		self.__w_mat = []
		self.__computed = False

	def get_d_mat(self):
		return self.__d_mat

	def get_w_mat(self):
		return self.__w_mat

	def compute_gower_distance_matrix(self):
		if self.__computed:
			return
		
		N = self.__data.shape[0]
		K = self.__data.shape[1]
		d_mat = np.zeros((K, N, N))
		w_mat = np.zeros((K, N, N))

		for k in range(K):
			d_k = self.__data.iloc[:,k]
			R = 1
			if d_k.dtype != object:
				R = np.nanmax(self.__data.iloc[:,k].values) - np.nanmin(self.__data.iloc[:,k].values)

			for i in range(N):
				for j in range(i):
					if d_k.dtype == bool:
						(d_mat[k,i,j], w_mat[k,i,j]) = \
							self.__get_distance_binary(d_k[i], d_k[j])
					elif d_k.dtype == object:
						(d_mat[k,i,j], w_mat[k,i,j]) = \
							self.__get_distance_categorical(d_k[i], d_k[j])
					else:
						(d_mat[k,i,j], w_mat[k,i,j]) = \
							self.__get_distance_continuous(d_k[i], d_k[j], R)

		self.__d_mat = d_mat
		self.__w_mat = w_mat
		self.__computed = True

	def compute_gower_dist(self, i, j):
		if i == j:
			return 1
		if j > i:
			(i,j) = (j,i)

		self.compute_gower_distance_matrix()

		d_mat = self.__d_mat
		w_mat = self.__w_mat
		d = 0
		w = 0
		result = 0

		for k in range(K):
			d += d_mat[k,i,j] * w_mat[k,i,j]
			w += w_mat[k,i,j]
		if w > 0:
			result = d/w

		return result

	def __get_distance_binary(self, xi, xj):
		if np.isnan(xi) or np.isnan(xj):
			return (1,0)
		if xi == xj:
			if xi == True:
				return (0,1)
			else:
				return (1,0)
		else:
			return (1,1)

	def __get_distance_continuous(self, xi, xj, R):
		if R > 0:
			return (np.abs(xi - xj) / R, 1)
		return (1,0)

	def __get_distance_categorical(self, xi, xj):
		if xi == '' or xj == '':
			return (1,0)
		if xi == xj:
			return (0,1)
		else:
			return (1,1)
