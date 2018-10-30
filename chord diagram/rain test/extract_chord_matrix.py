import pandas as pd
import numpy as np
import json

df = pd.read_csv('data/tagged.csv')

'''
    get unique tags
'''

unique_tags_count = {}

for _,row in df.iterrows():
    if not pd.isnull(row['tag']):
        tags = row['tag'].split(',')
        for tag in tags:
            if tag not in unique_tags_count:
                unique_tags_count[tag] = 0
            unique_tags_count[tag] += 1


unique_tags = [
        y[0]
        for y in sorted(unique_tags_count.items(), key=lambda x: x[1], reverse=True)
    ]
print(unique_tags)

'''
    construct matrix (np.array)
'''

chord_mat = np.zeros((len(unique_tags), len(unique_tags)))
tag_index_map = {}
index = 0
for tag in unique_tags:
    tag_index_map[tag] = index
    index += 1

def fill_chord_mat(indices):
    if len(indices) == 1:
        chord_mat[indices[0], indices[0]] += 1
        return

    for i in indices:
        for j in indices:
            if i == j:
                continue
            chord_mat[i, j] += 1 / (len(indices) - 1)

for _,row in df.iterrows():
    if not pd.isnull(row['tag']):
        fill_chord_mat([tag_index_map[x] for x in row['tag'].split(',')])

print(chord_mat)

'''
    store json -
    {
        labels: ["Color", ...],
        mat: [[20, 11, 52, ...], ...]
    }
'''

with open('data/chord_mat.json', 'w') as handle:
    json.dump({
            'label': unique_tags,
            'mat': chord_mat.tolist(),
            'count': unique_tags_count
        },
        handle
    )
