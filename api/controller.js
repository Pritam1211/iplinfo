const { default: axios } = require("axios");
const cheerio = require("cheerio");
const redisService = require("./redis-service");
const { CONSTANTS } = require("./constants");

exports.getMatches = async (req, res) => {
	try {
		const url = 'https://m.cricbuzz.com/cricket-series/7607/indian-premier-league-2024/matches';
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let matches = [];
		let redisData = {};
		let id = 1;
		$(".mt-2").each((index, element) => {
			let date = $(element).find("a").first().find("div").first().find("span").text();
			$(element).children('div').first().children('div').each((index, item) => {
				let match = {};
				match.date = date;
				let box = $(item).find("a").first();
				match.url = $(item).find("a").first().attr("href").split("/").slice(2).join("/");
				match.location = $(box).children('div').first().find("div").text();
				[match.number, match.location] = match.location.split("•").map(i => i.trim());
				match.teams = [];
				match.result = $(box).children("span").last().text().trim();
				if (match.result == "") match.result = null;
				$(box).children('div').eq(1).children("div").each((index, it) => {
					let team = {};
					team.name = $(it).children("div").first().find("span").text();
					team.flag = $(it).children("div").first().find("img").attr("src");
					team.score = $(it).children("span").text();
					if (team.score == "") team.score = null;
					match.teams.push(team);
				})
				matches.push({ ...match, id });
				redisData[Number(id)] = { url: match.url, teams: match.teams, result: match.result };
				id++;
			})
		});
		await redisService.setData(CONSTANTS.REDIS_KEYS.MATCHES, JSON.stringify(redisData));
		res.status(200).json({ success: true, data: matches })
	} catch (error) {
		console.log("error in getMatches ::>>", error)
		res.status(500).json({ success: false, message: error.message || error })
	}

}


exports.getLiveScore = async (req, res) => {
	try {
		let matches = await redisService.getData(CONSTANTS.REDIS_KEYS.MATCHES);
		matches = JSON.parse(matches);
		const url = `https://m.cricbuzz.com/live-cricket-scores/${matches[req.params.id].url}`;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let bowling = [];
		let batting = [];
		let score = [];
		let result = $("#miniscore-branding-container").find("div.text-cbTextLink").first().text().trim();
		$("#miniscore-branding-container").find("div.mr-2").each((index, item) => {
			score.push({ name: $(item).text().trim(), value: $(item).next("div").text().trim() })
		})
		let bat = $("#miniscore-branding-container").find("div.mx-4").first().children("div").eq(1).children("div").eq(1).children("div").eq(0);
		$(bat).children('div.scorecard-bat-grid').each((index, item) => {
			batting.push({
				name: $(item).find("div").first().text().trim(),
				runs: $(item).find("div").eq(1).text(),
				balls: $(item).find("div").eq(2).text(),
				fours: $(item).find("div").eq(3).text(),
				sixes: $(item).find("div").eq(4).text(),
				sr: $(item).find("div").eq(5).text(),
			})
		})

		let bowl = $("#miniscore-branding-container").find("div.mx-4").first().children("div").eq(1).children("div").eq(1).children("div").eq(1);
		$(bowl).children('div.scorecard-bat-grid').each((index, item) => {
			bowling.push({
				name: $(item).find("div").first().text().trim(),
				over: $(item).find("div").eq(1).text(),
				maiden: $(item).find("div").eq(2).text(),
				run: $(item).find("div").eq(3).text(),
				wicket: $(item).find("div").eq(4).text(),
				eco: $(item).find("div").eq(5).text(),
			})
		})
		res.status(200).json({ success: true, data: { batting, bowling, result, id: req.params.id, ...matches[req.params.id] } })
	} catch (error) {
		console.log("error in getLiveScore ::>>", error)
		res.status(500).json({ success: false, message: error.message || error })
	}
}

exports.getScoreCard = async (req, res) => {
	try {
		let matches = await redisService.getData(CONSTANTS.REDIS_KEYS.MATCHES);
		matches = JSON.parse(matches);
		const url = `https://m.cricbuzz.com/live-cricket-scorecard/${matches[req.params.id].url}`;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let scoreCard = { inning1: { batting: [], bowling: [] }, inning2: {} }
		scoreCard.status = $("div.text-cbLive").text().trim();
		if (scoreCard.status == "") scoreCard.status = $("div.text-cbComplete").text().trim();
		scoreCard.inning1 = getInings($, 1);
		scoreCard.inning2 = getInings($, 2);
		res.status(200).json({ success: true, data: { ...scoreCard, id: req.params.id } })
	} catch (error) {
		console.log("error in getScoreCard ::>>", error)
		res.status(500).json({ success: false, message: error.message || error })
	}
}

exports.getInfo = async (req, res) => {
	try {
		let matches = await redisService.getData(CONSTANTS.REDIS_KEYS.MATCHES);
		matches = JSON.parse(matches);
		const url = `https://m.cricbuzz.com/cricket-match-facts/${matches[req.params.id].url}`;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);

		let info = []

		$("a[title=INFO]").parent().children("div").each((index, item) => {
			info.push({ name: $(item).children("div").first().text().trim(), value: $(item).children("div, a").eq(1).text().trim() });
		})
		res.status(200).json({ success: true, data: info })
	} catch (error) {
		console.log("error in getInfos ::>>", error)
		res.status(500).json({ success: false, message: error.message || error })
	}
}

exports.getPointTable = async (req, res) => {
	try {
		const url = `https://m.cricbuzz.com/cricket-series/7607/indian-premier-league-2024/points-table`;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let table = [];
		$("div.point-table-grid").each((index, item) => {
			if (index == 0) return;
			let team = {};
			team.rank = $(item).children('div').eq(0).text().trim();
			team.team = $(item).children('div').eq(1).text().trim();
			team.flag = $(item).children('div').eq(1).find('img').attr('src');
			team.matches = $(item).children('div').eq(2).text().trim();
			team.win = $(item).children('div').eq(3).text().trim();
			team.lose = $(item).children('div').eq(4).text().trim();
			team.nr = $(item).children('div').eq(5).text().trim();
			team.point = $(item).children('div').eq(6).text().trim();
			team.nrr = $(item).children('div').eq(7).text().trim();
			table.push(team);
		})
		res.status(200).json({ success: true, data: table })
	} catch (error) {
		console.log("error in getPointTable ::>>", error)
		res.status(500).json({ success: false, message: error.message || error })
	}
}

exports.getTeams = async (req, res) => {
	try {
		const url = `https://m.cricbuzz.com/cricket-series/7607/indian-premier-league-2024/points-table`;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let teams = [];
		let id = 1;
		$("div.point-table-grid").each((index, item) => {
			if (index == 0) return;
			teams.push({
				name: String($(item).children('div').eq(1).find('a').attr('href').split('/')[2]).replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
				abr: $(item).children('div').eq(1).text().trim(),
				flag: $(item).children('div').eq(1).find('img').attr('src'),
				href: $(item).children('div').eq(1).find('a').attr('href'),
				id: id++
			})
		})
		res.status(200).json({ success: true, data: teams })
	} catch (error) {
		console.log("error in getTeams ::>>", error)
		res.status(500).json({ success: false, message: error.message || error })
	}
}

exports.getTemaMembers = async (req, res) => {
	try {
		const url = `https://m.cricbuzz.com${req.body.url}/players`;//`https://m.cricbuzz.com/${req.body.url}/players`;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);
		let team = { batsmen: [], bowler: [], all_rounder: [], wicket_keeper: [] };
		let type = ['BATSMEN', 'ALL ROUNDER', 'BOWLER', 'WICKET KEEPER']

		type.forEach((t) => {
			$(`a[title='${t}']`).parent().next("div").children("a").each((index, item) => {
				team[t.toLowerCase().replace(' ', '_')].push({
					name: $(item).children("div").first().find('span').first().text().trim(),
					photo: $(item).children('div').first().find("img").first().attr('src')
				});
			})
		});

		res.status(200).json({ success: true, data: team })
	} catch (error) {
		console.log("error in getTeamMembers ::>>", error)
		res.status(500).json({ success: false, message: error.message || error })
	}
}


getInings = ($, i) => {
	try {
		let battingTeam = $(`div[id*='innings-${i}']`).children("div").first().text();
		let score = $(`div[id*='innings-${i}']`).children("div").eq(1).text();
		let bat = $(`div[id*=innings-${i}]`).last().children("div.mb-2").first().children("div").first();
		let batting = [];
		$(bat).children("div.scorecard-bat-grid").each((index, item) => {
			batting.push({
				name: $(item).children("div").first().find("a").text().trim(),
				status: $(item).children("div").find("div").text().trim(),
				runs: $(item).children("div").eq(1).text(),
				balls: $(item).children("div").eq(2).text(),
				fours: $(item).children("div").eq(3).text(),
				sixes: $(item).children("div").eq(4).text(),
				sr: $(item).children("div").eq(5).text(),
			});
		})
		let extras = $(bat).children("div:nth-last-child(3)").children("div").eq(1).text().trim();
		let total = $(bat).children("div:nth-last-child(2)").children("div").first(1).children("div").eq(1).text().trim();
		let yetToBat = $(bat).children("div:nth-last-child(1)").children("div").eq(1).text().trim();

		let bowling = [];
		$(`div[id*=innings-${i}]`).find("div.scorecard-bowl-grid").each((index, item) => {
			bowling.push({
				name: $(item).children("a").first().text().trim(),
				over: $(item).children("div").first().text(),
				maiden: $(item).children("div").eq(1).text(),
				run: $(item).children("div").eq(2).text(),
				wicket: $(item).children("div").eq(3).text(),
				noball: $(item).children("div").eq(4).text(),
				wide: $(item).children("div").eq(5).text(),
				eco: $(item).children("div").eq(6).text(),
			});
		})
		bowling.splice(0, 1);
		return { battingTeam, batting, bowling, score, extras, total, yetToBat };
	} catch (error) {
		console.log("error in getMatches ::>>", error)
		throw error;
	}
}