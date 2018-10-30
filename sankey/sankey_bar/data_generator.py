import numpy as np

class DataGenerator:
	def __init__(self):	
		pass

	"""
		(list of tuples, int) -> (dict of rows)

		Generates 

		rng_config example:

		In:
			generate_data(
				[
					# (label, start, stop, sample with replacement, prefix label)
					('action', 1, 2, true, true),
					('events', 4, 99, true, false),
					 ...
				],
				5 # number of rows
			)

		Out:
			{
				action: [action1, action2, action2, action1, action2],
				events: [5, 88, 12, 55, 4],
				...
			}
	"""
	def generate_data(self, rng_config, nrows):
		data = {}
		for rng in rng_config:
			label = rng[0]
			low = rng[1]
			high = rng[2]
			step = rng[3]
			replace = rng[4]
			prefix_label = rng[5]

			data_range = np.arange(low, high, step)
			data_entry = [(label + str(i)) for i in data_range] if prefix_label else data_range
			data[label] = np.random.choice(data_entry, nrows, replace)

		return data
