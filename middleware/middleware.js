const jwt = require('jsonwebtoken')

module.exports.middleware = async (req, res, next) => {
    try {
       
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                error: "Authorization token required"
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        
     
        if (!token) {
            return res.status(401).json({
                error: "Token not found"
            })
        }

        const user = await jwt.verify(token, process.env.JWT_KEY)
        req.user = user;

        return next(); 
        
    } catch (e) {
        console.log('Auth error:', e.message)
        return res.status(401).json({
            error: "Invalid or expired token"
        })
    }
}