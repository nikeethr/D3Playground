from bs4 import BeautifulSoup
import pandas as pd
import requests

def extract_feedback(url_base=None, url_survey=None, output_csv=None):
	if url_survey is None and url_base is None:
		raise Exception("url not provided.")

	soup = None

	try:
		print('Attempting to fetch feedback from url')
		soup = url_to_soup(url_survey)
	except Exception as e:
		print('Could not fetch feedback from url')
		print('error:')
		print(str(e))
		
	if soup is None:
		print('Could not convert to soup')
		return

	print('Converted main page to soup')
	
	responses = soup.select('body > div > table:nth-of-type(3) tr')
	data = []

	
	for r in responses:
		td = r.select('td')
		data_row = {}
		if len(td) == 3:
			try:
				data_row['url'] = (url_base + td[0].select('a')[0]['href']).strip()
				data_row['id'] = td[0].select('a')[0].get_text().strip()
				data_row['date'] = td[1].get_text().strip()
				data_row['count'] = td[2].get_text().strip()

				soup_response = url_to_soup(data_row['url'])
				sub_responses = soup_response.select('body > div > table:nth-of-type(3) tr')

				for sub_r in sub_responses:
					td = sub_r.select('td')
					if len(td) == 3:
						data_row[td[1].get_text()] = td[2].get_text().strip()

				data += [data_row]
			except Exception as e:
				print('Could not parse response. Exiting...')
				print('error:')
				print(str(e))
				return

	# save csv
	if output_csv is not None:
		with open(output_csv, 'w', encoding='utf-8', errors='replace') as f:
			pd.DataFrame(data).to_csv(f, index=False)

def url_to_soup(url, filename = None):
	print(url)
	r = requests.get(url)
	text = r.text

	if filename is not None:
		with open(filename, 'w') as f:
			f.write(text)

	return BeautifulSoup(text)

# unused for now unless we need to recover from file if feedback url is down...
def file_to_soup(filename):
	text = None
	with open(filename, 'r') as f:
		text = f.read()

	return BeautifulSoup(text)

if __name__ == '__main__':
	url_base = 'http://oias.bom.gov.au:8700/tms/'
	url_survey = url_base + 'S2_RESPONSE_SUM?PARAMKEY=SurveyId=MOBILE_FKB_13,PrintQuestions=Y'
	filename_base = 'feedback_raw/feedback'
	extract_feedback(url_base = url_base, url_survey = url_survey, output_csv = 'feedback.csv')
