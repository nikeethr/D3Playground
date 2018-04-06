import numpy as np
import pandas as pd

class DataframeToGraphConverter:
	def __init__(self):
		pass

	def convert_dataframe_to_graph(self, df, column_order, val):
		nodes = []
		links = []

		for i in range(len(column_order)):
			nodes.extend(np.unique(df[column_order[i]]))

		for i in range(len(column_order)):
			if i == (len(column_order) - 1):
				break
			else:
				df_aggregate = df.groupby([column_order[i], column_order[i+1]])[val].sum().reset_index()
				for index, row in df_aggregate.iterrows():
					link = {
						'source': nodes.index(row[column_order[i]]),
						'target': nodes.index(row[column_order[i+1]]),
						'value': row[val]
					}
					links.append(link)

		nodes = [{'name': node} for node in nodes]

		data_graph = {
			'nodes': nodes,
			'links': links
		}

		return data_graph
