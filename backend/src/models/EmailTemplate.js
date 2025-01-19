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
        variables: {
            type: Map,
            of: String
        },
        images: [String],
        styles: {
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