import pandas as pd
import numpy as np
import json

class MyEncoder(json.JSONEncoder):
	def default(self, obj):
		if isinstance(obj, np.integer):
			return int(obj)
		elif isinstance(obj, np.floating):
			return float(obj)
		elif isinstance(obj, np.ndarray):
			return obj.tolist()
		else:
			return super(MyEncoder, self).default(obj)

if __name__ == "__main__":
	df = pd.read_csv('data.csv')
	df_grouped = df.groupby(['Group', 'Title'], as_index=False).sum()

	d = dict()
	# root
	d['name'] = 'VIC'
	d['views'] = np.sum(df_grouped['Views'].values)
	d['group'] = []

	for group in np.unique(df_grouped['Group'].values):
		df_this = df_grouped[df_grouped['Group'] == group][['Title', 'Views']]

		d_this = dict()
		d_this['name'] = group
		d_this['views'] = np.sum(df_this['Views'].values)

		df_this['name'] = df_this['Title']
		df_this['views'] = df_this['Views']
		del df_this['Title']
		del df_this['Views']

		d_this['group'] = df_this.to_dict('records')

		d['group'].append(d_this)

	with open('data.json', 'w') as f:
		f.write(json.dumps(d, cls=MyEncoder, indent=4))
