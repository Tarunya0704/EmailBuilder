const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    layout: {
        type: String,
        required: true
    },
    config: {
        sections: [String],
        title: String,
        content: String,
        imageUrl: String,
        footer: String,
        style: {
            titleColor: String,
            titleSize: String,
            titleAlignment: String,
            contentColor: String,
            contentSize: String,
            contentAlignment: String,
            footerColor: String,
            footerSize: String,
            footerAlignment: String,
            backgroundColor: String
        },
        variables: {
            type: Map,
            of: String
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);