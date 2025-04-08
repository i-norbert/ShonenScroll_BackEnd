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
      include: [
        {
          model: User,
          as: "Requester", // must match alias in `Friendship.belongsTo`
          attributes: ["userid", "username", "profilePicture"]
        }
      ],
    });



    // Return just the requester user objects
    const users = requests.map(r => r.Requester);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get pending requests" });
  }
};

// Delete a Friend (unfriend)
exports.deleteFriend = async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    // Remove both directions of the accepted friendship
    const deleted = await Promise.all([
      Friendship.destroy({ where: { userId, friendId, status: "accepted" } }),
      Friendship.destroy({ where: { userId: friendId, friendId: userId, status: "accepted" } })
    ]);

    const deletedCount = deleted[0] + deleted[1];
    if (deletedCount === 0) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    res.json({ message: "Friendship deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete friendship" });
  }
};

exports.getSent = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await Friendship.findAll({
      where: { userId, status: "pending" },
      include: [
        {
          model: User,
          as: "Addressee", // Correct alias that matches the model definition
          attributes: ["userid", "username", "profilePicture"]
        }
      ]
    });

    const users = requests.map(r => r.Addressee); // Also updated to match alias
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get sent requests" });
  }
};

