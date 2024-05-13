import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbconnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    await dbconnect()

    try {
        const { username, email, password } = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username, isVerified: true
        })
        // find username that is verified too
        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: 'username is taken'
            },
                {
                    status: 400
                })
        }
        const existingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: 'Email already exist'
                },
                    {
                        status: 400
                    })
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }

        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []

            })
            await newUser.save()
        }
        // verification email
        const emailRes = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if (!emailRes.success) {
            return Response.json({
                success: false,
                message: emailRes.message
            },
                { status: 500 })
        }
        return Response.json({
            success: true,
            message: 'User Registered successfully.'
        }, {
            status: 201
        })
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
