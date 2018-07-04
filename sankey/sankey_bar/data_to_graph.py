import numpy as np
import pandas as pd

class DataframeToGraphConverter:
	def __init__(self):
		pass
	
	def find_index(self, l, f, e):
		for i,v in enumerate(l):
			if f(v) == e:
				return i
		return -1

	def convert_dataframe_to_graph(self, df, column_order, val):
		nodes = []
		links = []

		for i in range(len(column_order)):
			nodes.extend(
				[{'name':x, 'group':column_order[i]} for x in np.unique(df[column_order[i]])])

		for i in range(len(column_order)):
			if i == (len(column_order) - 1):
				break
			else:
				df_aggregate = df.groupby([column_order[i], column_order[i+1]])[val].sum().reset_index()
				for index, row in df_aggregate.iterrows():
					link = {
						'source': self.find_index(nodes, lambda x: x['name'], row[column_order[i]]),
						'target': self.find_index(nodes, lambda x: x['name'], row[column_order[i+1]]),
						'value': row[val]
					}
					links.append(link)

		data_graph = {
			'nodes': nodes,
			'links': links
		}

		return data_graph
