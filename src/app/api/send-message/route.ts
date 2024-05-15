import dbconnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
    await dbconnect()
    const { username, content } = await request.json()
    try {
        const user = await UserModel.findOne({ username })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }
        // user accepting messages or not
        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: 'User not accepting messages',
                },
                { status: 403 }
            );
        }
        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        await user.save()
        return Response.json(
            {
                success: true,
                message: 'Message sent successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.log('An unexpected Error occured', error)
        return Response.json(
            {
                success: false,
                message: 'An unexpected Error occured',
            },
            { status: 500 }
        );
    }
}