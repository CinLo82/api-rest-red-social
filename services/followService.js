const Follow = require('../models/follow')

const followUserIds = async (identityUserId) => {
    try{
        // sacar info de seguimientos
        let following = await Follow.find({ user: identityUserId })
            .select({ _id: 0, __v: 0, user: 0 })
            .exec()

        let follower = await Follow.find({ followed: identityUserId })
            .select({ _id: 0, __v: 0, followed: 0 })
            .exec()

        // Procesar following ids
        let followingClean = []
        following.forEach((follow) => {
            followingClean.push(follow.followed)
        })
        
        // Procesar followed ids
        let followerClean = []
        follower.forEach((follow) => {
            followerClean.push(follow.user)
        })

        return { 
            following: followingClean, 
            follower: followerClean
        }
    } catch (error) {
        return false
    }
}

const followThisUser = async (identityUserId, profileUserId) => {
    try{
        
        // sacar info de seguimientos
        let following = await Follow.findOne({ 'user': identityUserId, 'followed': profileUserId })

        let follower = await Follow.findOne({ 'user': identityUserId, 'followed': profileUserId })
        return { 
            following, 
            follower
        }
       
    } catch (error) {
        return false
    } 
}

module.exports = {
    followUserIds,
    followThisUser
}