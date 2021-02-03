
const Users = require('./../../models/users')
const Utils = require('./../../utils')
const fs = require('fs')
var admin = require("firebase-admin");

class UsersController {

    constructor() {

    }

    async search(req, res) {
        try {

            let input = req.body
            input.search = input.search || ""
            input.page = input.page || 1
            input.per_page = input.per_page || 10

            let users_query = Users.query((qb) => {
                if (input.search) {
                    qb.where('name', 'LIKE', `%${input.search}%`)
                    qb.orWhere('email', 'LIKE', `%${input.search}%`)
                }
                qb.orderBy('id', 'DESC')
            })

            let users = await users_query.fetchPage({
                columns: ['id', 'name', 'email', 'created_at', 'updated_at', 'role'],
                page: input.page,
                pageSize: input.per_page
            })

            let users_rs = users.toJSON()
            let count = await users_query.count()
            console.log(users_rs);

            res.status(200).json({
                count: count,
                data: users_rs
            })

        } catch (err) {
            console.log(err.stack)
            res.status(400).json({
                message: err.message
            })
        }
    }

    async createUser(req, res) {
        try {

            let input = req.body
            input.email = input.email || ""
            input.name = input.name || ""
            input.role = input.role || "member"
            input.image = input.image || ""

            if (!new Utils().validateEmail(input.email)) {
                throw new Error("Invalid email.")
            }

            if (!input.name) {
                throw new Error("Require name.")
            }

            if (!input.password) {
                throw new Error("Require password.")
            }

            let password = new Utils().encryptPassword(input.password)

            // check 
            let user = await Users.where('email', input.email).fetch()
            if (user) {
                throw new Error("มีผู้ใช้งานนี้แล้ว.")
            }

            let role = "member"

            if (req.authen && req.authen.role == "admin") {
                role = input.role
            }

            await new Users({
                email: input.email,
                name: input.name,
                password: password,
                role: role,
                image: input.image
            }).save()

            res.status(200).json({
                message: "complete"
            })

        } catch (err) {
            console.log(err.stack)
            res.status(400).json({
                message: err.message
            })
        }
    }

    async updateUser(req, res) {
        try {

            let input = req.body
            let authen = req.authen
            console.log(authen.id, req.params.user_id)
            let user_id = req.params.user_id
            if (authen.id != user_id) {
                throw new Error("ไม่มีสิทธิ์เข้าถึง.")
            }

            input.name = input.name || ""
            if (!input.name) {
                throw new Error("Require name.")
            }

            // check 
            let user = await Users.where('id', user_id).fetch()

            if (!user) {
                throw new Error("ไม่มีผู้ใช้งานนี้.")
            }

            await user.save({
                name: input.name,
                email: input.email,
                password: input.password,
                role: input.role,
                work_id: input.position,
                image: input.image

            }, { methods: "update", patch: true })

            res.status(200).json({
                message: "complete"
            })

        } catch (err) {
            console.log(err.stack)
            res.status(400).json({
                message: err.message
            })
        }
    }

    async deleteUser(req, res) {
        try {
            let authen = req.authen
            let user_id = req.params.user_id

            if (authen.id != user_id) {
                throw new Error("ไม่มีสิทธิ์เข้าถึง.")
            }
            // check 
            let user = await Users.where('id', user_id).fetch()
            if (!user) {
                throw new Error("ไม่มีผู้ใช้งานนี้.")
            }

            await user.destroy({ require: false })

            res.status(200).json({
                message: "complete"
            })

        } catch (err) {
            console.log(err.stack)
            res.status(400).json({
                message: err.message
            })
        }
    }

    // async getByID(req, res) {
    //     try {
    //         let user_id = req.params.user_id

    //         let users_query = Users.query((qb) => {
    //             if (user_id) {
    //                 qb.where('id', '=', `${user_id}`)
    //             }
    //         })

    //         let users = await users_query.fetchPage({
    //             columns: ['id', 'name', 'email', 'created_at', 'updated_at', 'role']
    //         })

    //         let users_rs = users.toJSON()
    //         let count = await users_query.count()

    //         res.status(200).json({
    //             count: count,
    //             data: users_rs
    //         })

    //     } catch (err) {
    //         console.log(err.stack)
    //         res.status(400).json({
    //             message: err.message
    //         })
    //     }
    // }

    // async getByID(req, res) {
    //     try {
    //         let authen = req.authen
    //         // let user_id = req.authen.id

    //         let users_query = Users.query((qb) => {
    //             if (authen) {
    //                 qb.join('works', 'users.work_id', '=', 'works.work_id')
    //                 qb.select('users.id', 'users.name', 'works.work_id', 'works.work_name')
    //                 qb.where('works.work_id', '=', 1)
    //             }

    //             let sql = qb.toString()

    //             console.log(sql);
    //         })

    //         let users_count = users_query.clone()
    //         // let users = await users_query.fetchPage({
    //         //     pageSize: 10,
    //         //     page: 1
    //         // })
    //         let users = await users_query.fetchAll()



    //         let users_rs = users.toJSON()

    //         let count = users_rs.length//await users_count.count()

    //         res.status(200).json({
    //             count: count,
    //             data: users_rs
    //         })

    //     } catch (err) {
    //         console.log(err.stack)
    //         res.status(400).json({
    //             message: err.message
    //         })
    //     }
    // }

    async getByID(req, res) {
        try {
            let authen = req.authen
            let user_id = req.authen.id
            let users_query = Users.query((qb) => {
                if (authen) {
                    qb.join('works', 'users.work_id', '=', 'works.work_id')
                    qb.where('id', '=', user_id)

                }
            })

            let user = await users_query.fetchPage({
                columns: ['name', 'email', 'role', 'created_at', 'updated_at', 'work_name', 'image'], 
                pageSize: 10,
                page: 1
            })

            let user_rs = user.toJSON()
            console.log(user_rs);
            res.status(200).json({
                data: user_rs
            })

        } catch (err) {
            console.log(err.stack)
            res.status(400).json({
                message: err.message
            })
        }
    }

    // async getByID(req, res) {
    //     try {
    //         let authen = req.authen
    //         // let user_id = req.authen.id

    //         let users_query = Users.query((qb) => {
    //             if (authen) {
    //                 qb.join('works', 'users.work_id', '=', 'works.work_id')
    //                 .select('users.id', 'users.name', 'works.work_id', 'works.work_name')
    //                 .where('works.work_id', '=', 3)
    //             }
    //         })

    //         let users_count = users_query.clone()

    //         let users = await users_query.fetchPage({
    //             pageSize: 10,
    //             page: 1
    //         })

    //         let users_rs = users.toJSON()

    //         let count = await users_count.count()

    //         res.status(200).json({
    //             count: count,
    //             data: users_rs
    //         })

    //     } catch (err) {
    //         console.log(err.stack)
    //         res.status(400).json({
    //             message: err.message
    //         })
    //     }
    // }

    async UploadImage(req, res) {
        try {
            let image = req.file.buffer
            let filename = `${Date.now()}-${req.file.originalname}`
            let save_patch = `${process.cwd()}/public/temp/${filename}`

            fs.writeFileSync(`${process.cwd()}/public/temp/${filename}`, image)
            let upload = admin.storage().bucket()

            let res_upload = await upload.upload(save_patch,{

            })
            fs.unlinkSync(save_patch)
            // console.log();
            // res_upload[0]
            
            let getpath = await res_upload[0].getMetadata()
            getpath = getpath[0]
            let url = `https://firebasestorage.googleapis.com/v0/b/${getpath.bucket}/o/${getpath.name}?alt=media`
            return res.json({
                patch: url
            })

        } catch (err) {
            console.log(err.stack)
            res.status(400).json({
                message: err.message
            })
        }
    }
}

module.exports = UsersController
