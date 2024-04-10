const { getMatches, getLiveScore, getScoreCard, getInfo, getPointTable, getTemaMembers, getTeams } = require('./controller');

const router = require('express').Router();

router.get("/matches", getMatches);
router.get("/point-table", getPointTable);
router.get("/live-score/:id", getLiveScore);
router.get("/scorecard/:id", getScoreCard);
router.get("/match-info/:id", getInfo);
router.get("/teams", getTeams);
router.post("/team-members", getTemaMembers);


module.exports = { router };