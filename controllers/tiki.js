// controllers/tiki.js
exports.renderForm = (req, res) => {
    res.render('tiki');
};

exports.submitForm = (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    res.send(`Name: ${name}, Email: ${email}`);
};
