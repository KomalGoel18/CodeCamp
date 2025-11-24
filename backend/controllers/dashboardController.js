import Submission from '../models/Submission.js';


export const getDashboardData = async (req, res) => {
try {
const user = req.user; // populated by protect
const userId = user._id;


const totalSubmissions = await Submission.countDocuments({ user: userId });
const solvedProblems = await Submission.distinct('problem', { user: userId, verdict: 'Accepted' });
const totalSolved = solvedProblems.length;


// difficulty summary (similar to your earlier aggregation)
const difficultyStats = await Submission.aggregate([
{ $match: { user: userId, verdict: 'Accepted' } },
{ $lookup: { from: 'problems', localField: 'problem', foreignField: '_id', as: 'problemDetails' } },
{ $unwind: '$problemDetails' },
{ $group: { _id: '$problemDetails.difficulty', count: { $sum: 1 } } }
]);


const difficultySummary = { easy: 0, medium: 0, hard: 0 };
difficultyStats.forEach(s => { difficultySummary[s._id] = s.count; });


const displayName = user.username || user.name || user.email || 'Coder';


res.json({
username: displayName,
welcomeMessage: `Hi ${displayName} 👋`,
totalSolved,
totalSubmissions,
difficultySummary,
lastSolvedAt: user.lastSolvedAt || null,
});
} catch (err) {
console.error('Dashboard Fetch Error:', err);
res.status(500).json({ message: 'Server error loading dashboard data' });
}
};