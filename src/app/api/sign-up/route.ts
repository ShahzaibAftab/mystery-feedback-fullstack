import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbconnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    await dbconnect()

    try {
        const { username, email, password } = await request.json()
    } catch (error) {
        console.error('Error registering User', error)
        return Response.json(
            {
                success: false,
                message: 'Error registering User'
            },
            {
                status: 500
            }
        )
    }
}
