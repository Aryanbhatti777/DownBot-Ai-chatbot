import contextModel from "../models/context.model.js";


export async function upsertContext(context, userId) {
    return contextModel.findOneAndUpdate({
        user: userId
    }, {
        context
    }, {
        upsert: true,
        new: true
    })
}

export async function getContextByUser(userId) {
    return contextModel.findOne({user: userId});
}