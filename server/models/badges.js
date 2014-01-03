module.exports = [
    {
        _id: 'keepItUp',
        match: function(User, callback) {
            var streak = User.getStreak('food');
            return callback(null, streak.value >= 3 && streak.value < 14);
        }
    },
    {
        _id: 'regular',
        match: function(User, callback) {
            var streak = User.getStreak('food');
            return callback(null, streak.value >= 3 && streak.value < 14);
        }
    },
    {
        _id: 'dedicated',
        match: function(User, callback) {
            var streak = User.getStreak('food');
            return callback(null, streak.value >= 3 && streak.value < 14);
        }
    },
    {
        _id: 'committed',
        match: function(User, callback) {
            var streak = User.getStreak('food');
            return callback(null, streak.value >= 3 && streak.value < 14);
        }
    },
    {
        _id: 'hardcore',
        match: function(User, callback) {
            var streak = User.getStreak('food');
            return callback(null, streak.value >= 3 && streak.value < 14);
        }
    },
    {
        _id: 'exerciseBuff',
        match: function(User, callback) {
            var streak = User.getStreak('food');
            return callback(null, streak.value >= 3 && streak.value < 14);
        }
    }
];