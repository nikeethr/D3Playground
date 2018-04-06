import numpy as np
import pandas as pd
import json
from data_generator import DataGenerator
from data_to_graph import DataframeToGraphConverter

csv_out = 'rng_data.csv'
json_out = 'rng_graph.json'

def main():
	# generate data

	nrows = 50
	dg = DataGenerator()
	dc = DataframeToGraphConverter()

	# todo: probability distribution

	rng_config = [
		('category', 1, 4, True, True),
		('action', 1, 10, True, True),
		('label', 1, nrows * 2, False, True), # set stop to nrows * 2 to guarentee (stop - start) > nrows
		('uniqueEvents', 1, 50, True, False) 
	]

	data = dg.generate_data(rng_config, nrows)

	# convert data to dataframe
	df = pd.DataFrame(data)
	df.to_csv(csv_out, index=False)

	# convert dataframe to graph structure
	data_graph = dc.convert_dataframe_to_graph(df, ['category', 'action', 'label'], 'uniqueEvents')

	with open(json_out, 'w') as f:
		json.dump(data_graph, f, separators=(',',':'))
		# pretty version for testing:
		# json.dump(data_graph, f, indent=4, separators=(',',': '))
	
if __name__ == '__main__':
	main()
