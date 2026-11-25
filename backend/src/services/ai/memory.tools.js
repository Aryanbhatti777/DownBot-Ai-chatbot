import { upsertContext, getContextByUser } from "../../DAO/context.dao.js";
import * as z from 'zod'
import { tool } from 'langchain'

export const getUserContext = tool(
    async ( _, config) => {
        const { userId } = config.configurable
        const context = await getContextByUser(userId);
        return context.context
    }, {
    name: "getUserContext",
    description: `Use this tool to retrieve the current user's context.`,
    schema: z.object({})
    }
)

export const setUserContext = tool(
    async ({context }, config) => {
        const { userId } = config.configurable;
        const updatedContext = await upsertContext(context, userId);
        return updatedContext.context
    }, {
    name: "setUserContext",
    description: `Use this to create or update the current user context.
        use this tool: 
        - When you know something new about the user that will lsat long for days/weeks/moths/years
        -When you want to persist user-specifc information across sessions`,
        schema: z.object({
        context: z.string()
    })
    }
)