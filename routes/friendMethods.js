const User = require("../models/User");
const Friendship = require("../models/Friendship");

// Send Friend Request
exports.sendRequest = async (req, res) => {
  const { userId, friendId } = req.body;

  if (userId === friendId) return res.status(400).json({ error: "Can't friend yourself" });

  try {
    const existing = await Friendship.findOne({ where: { userId, friendId } });
    if (existing) return res.status(400).json({ error: "Request already exists or you're already friends" });

    await Friendship.create({ userId, friendId, status: "pending" });
    res.json({ message: "Friend request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send request" });
  }
};

// Accept Friend Request
exports.acceptRequest = async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const request = await Friendship.findOne({ where: { userId: friendId, friendId: userId, status: "pending" } });

    if (!request) return res.status(404).json({ error: "No pending request found" });

    await request.update({ status: "accepted" });
    await Friendship.create({ userId, friendId, status: "accepted" }); // create reverse record

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept request" });
  }
};

// Decline Friend Request
exports.declineRequest = async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const request = await Friendship.findOne({ where: { userId: friendId, friendId: userId, status: "pending" } });

    if (!request) return res.status(404).json({ error: "No pending request found" });

    await request.destroy();
    res.json({ message: "Friend request declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to decline request" });
  }
};

// Get Friends
exports.getFriends = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      include: {
        model: User,
        as: "Friends",
        through: { where: { status: "accepted" } },
      },
    });

    res.json(user.Friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get friends" });
  }
};

// Get Pending Requests
exports.getPending = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await Friendship.findAll({
      where: { friendId: userId, status: "pending" },
      include: [{ model: User, as: "Requester", foreignKey: "userId" }],
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get pending requests" });
  }
};
