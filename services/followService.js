const Follow = require('../models/follow')

const followUserIds = async (identityUserId) => {
    try{
        // sacar info de seguimientos
        const following = await Follow.find({ user: identityUserId })
            .select({ _id: 0, __v: 0, user: 0 })
            .exec()

        const followed = await Follow.find({ followed: identityUserId })
            .select({ _id: 0, __v: 0, followed: 0 })
            .exec()

        // Procesar following ids
        let followingClean = []
        following.forEach((follow) => {
            followingClean.push(follow.followed)
        })
        
        // Procesar followed ids
        let followedClean = []
        followed.forEach((follow) => {
            followedClean.push(follow.user)
        })

        return { 
            following: followingClean, 
            followed: followedClean
        }
    } catch (error) {
         console.log(error)
    }
}

const followThisUser = async (identityUserId, porfileUserId) => {
    // Buscar si ya sigo a este usuario

}

module.exports = {
    followUserIds,
    followThisUser
}