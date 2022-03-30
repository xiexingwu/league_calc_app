champion_??.??.?.json
	Data Dragon raw champion data
	|
	v
champion_data.csv/.json
	csv/json of champion stats
	
item_stats.json
	GET request from
		https://leagueoflegends.fandom.com/api.php?format=json&action=parse&prop=text&text={{Module:ItemData/data}}
	with subsequent some basic regex parsing to conform with JSON
	|
	v
item_data.json
	json of item data
	| 	then parsed by 'parse_item_data.js' to filter SR items and sort items by tier
	v
	{"ornn":[...], "mythic":[...]}