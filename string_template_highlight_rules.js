/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var StringTemplateHighlightRules = function() {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        start: [{
            include: "#dollar"
        }],
        "#dollar": [{
            token: "comment.block.stringtemplate",
            regex: /\$!/,
            push: [{
                token: "comment.block.stringtemplate",
                regex: /!\$/,
                next: "pop"
            }, {
                defaultToken: "comment.block.stringtemplate"
            }],
            comment: "Comments"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /\$\s*(?=[^\$]+:)/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*\$/,
                next: "pop"
            }, {
                include: "#dollar-variable-template"
            }, {
                defaultToken: "meta.function.variable.template.stringtemplate"
            }],
            comment: "Template and variable calls"
        }, {
            token: [
                "punctuation.definition.delimiter.begin.stringtemplate",
                "keyword.control.if.stringtemplate",
                "punctuation.definition.control.begin.stringtemplate",
                "punctuation.definition.logical.not.stringtemplate"
            ],
            regex: /(\$\s*)(if|elseif)(\s*\(\s*)(!?)/,
            push: [{
                token: [
                    "punctuation.definition.control.end.stringtemplate",
                    "punctuation.definition.delimiter.end.stringtemplate"
                ],
                regex: /(\s*\))(\s*\$)/,
                next: "pop"
            }, {
                include: "#variable"
            }, {
                defaultToken: "meta.keyword.control.stringtemplate"
            }],
            comment: "Keyword calls"
        }, {
            token: [
                "punctuation.definition.delimiter.begin.stringtemplate",
                "support.function.stringtemplate",
                "punctuation.definition.function.begin.stringtemplate"
            ],
            regex: /(\$\s*)(first|last|rest|trunc|strip|length)(\s*\(\s*)/,
            push: [{
                token: [
                    "punctuation.definition.function.end.stringtemplate",
                    "punctuation.definition.delimiter.end.stringtemplate"
                ],
                regex: /(\s*\))(\s*\$)/,
                next: "pop"
            }, {
                include: "#variable"
            }, {
                defaultToken: "meta.function.support.stringtemplate"
            }],
            comment: "Function calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /\$\s*(?=\([^\$]+\)\()/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*\$/,
                next: "pop"
            }, {
                include: "#indirect-template"
            }, {
                defaultToken: "meta.function.template.indirect.stringtemplate"
            }],
            comment: "Indirect template calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /\$\s*(?=[^\$\.]+\()/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*\$/,
                next: "pop"
            }, {
                include: "#template"
            }, {
                defaultToken: "meta.function.template.stringtemplate"
            }],
            comment: "Template calls"
        }, {
            token: [
                "punctuation.definition.delimiter.begin.stringtemplate",
                "keyword.control.stringtemplate",
                "punctuation.definition.delimiter.end.stringtemplate"
            ],
            regex: /(\$\s*)(else|endif)(\s*\$)/,
            comment: "Keyword calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /\$\s*(?=[^\$]+;)/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*\$/,
                next: "pop"
            }, {
                include: "#dollar-variable-options"
            }, {
                defaultToken: "meta.variable.other.options.stringtemplate"
            }],
            comment: "Variable with option calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /\$\s*/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*\$/,
                next: "pop"
            }, {
                include: "#variable"
            }, {
                defaultToken: "meta.variable.other.stringtemplate"
            }],
            comment: "Variable calls"
        }],
        "#dollar-options": [{
            token: [
                "storage.modifier.option.stringtemplate",
                "punctuation.definition.equal.stringtemplate"
            ],
            regex: /(separator|format|null|wrap|anchor)(\s*=\s*)/,
            push: [{
                token: "punctuation.definition.comma.stringtemplate",
                regex: /\s*,\s*|(?=\$)/,
                next: "pop"
            }, {
                include: "#expression"
            }, {
                defaultToken: "meta.storage.modifier.option.stringtemplate"
            }],
            comment: "Variable option"
        }],
        "#dollar-variable-options": [{
            token: "punctuation.definition.semicolon.stringtemplate",
            regex: /;\s*/,
            push: [{
                token: "meta.punctuation.definition.semicolon.stringtemplate",
                regex: /(?=\$)/,
                next: "pop"
            }, {
                include: "#dollar-options"
            }, {
                defaultToken: "meta.punctuation.definition.semicolon.stringtemplate"
            }],
            comment: "Variable options"
        }, {
            include: "#variable"
        }],
        "#dollar-variable-template": [{
            token: [
                "punctuation.definition.template.call.stringtemplate",
                "punctuation.definition.anonymous.begin.stringtemplate",
                "variable.parameter.template.anonymous.stringtemplate",
                "punctuation.definition.comma.stringtemplate",
                "punctuation.definition.pipe.stringtemplate"
            ],
            regex: /(:\s*)(\{\s*)(?:(?:([A-Za-z]\w*)(\s*,?\s*))+(\|))?/,
            push: [{
                token: [
                    "punctuation.definition.anonymous.end.stringtemplate",
                    "punctuation.definition.comma.stringtemplate"
                ],
                regex: /(\}\s*)(,?)/,
                next: "pop"
            }, {
                include: "#expression-internal"
            }, {
                defaultToken: "meta.function.template.anonymous.stringtemplate"
            }],
            comment: "Indirect template with parameters"
        }, {
            token: "punctuation.definition.template.call.stringtemplate",
            regex: /:\s*(?=\()/,
            push: [{
                token: "meta.function.template.indirect.stringtemplate",
                regex: /(?=\$)/,
                next: "pop"
            }, {
                include: "#indirect-template"
            }, {
                defaultToken: "meta.function.template.indirect.stringtemplate"
            }],
            comment: "Indirect template"
        }, {
            token: "punctuation.definition.template.call.stringtemplate",
            regex: /:/,
            push: [{
                token: "meta.function.template.stringtemplate",
                regex: /(?=\$)/,
                next: "pop"
            }, {
                include: "#template"
            }, {
                defaultToken: "meta.function.template.stringtemplate"
            }],
            comment: "Template"
        }, {
            include: "#variable"
        }],
        "#angle": [{
            token: "comment.block.stringtemplate",
            regex: /<!/,
            push: [{
                token: "comment.block.stringtemplate",
                regex: /!>/,
                next: "pop"
            }, {
                defaultToken: "comment.block.stringtemplate"
            }],
            comment: "Comments"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /<(?=[^>]+:)/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: />/,
                next: "pop"
            }, {
                include: "#angle-variable-template"
            }, {
                defaultToken: "meta.function.variable.template.stringtemplate"
            }],
            comment: "Template and variable calls"
        }, {
            token: [
                "punctuation.definition.delimiter.begin.stringtemplate",
                "keyword.control.if.stringtemplate",
                "punctuation.definition.control.begin.stringtemplate",
                "punctuation.definition.logical.not.stringtemplate"
            ],
            regex: /(<\s*)(if|elseif)(\s*\(\s*)(!?)/,
            push: [{
                token: [
                    "punctuation.definition.control.end.stringtemplate",
                    "punctuation.definition.delimiter.end.stringtemplate"
                ],
                regex: /(\s*\))(\s*>)/,
                next: "pop"
            }, {
                include: "#variable"
            }, {
                defaultToken: "meta.keyword.control.stringtemplate"
            }],
            comment: "Keyword calls"
        }, {
            token: [
                "punctuation.definition.delimiter.begin.stringtemplate",
                "support.function.stringtemplate",
                "punctuation.definition.function.begin.stringtemplate"
            ],
            regex: /(<\s*)(first|last|rest|trunc|strip|length)(\s*\(\s*)/,
            push: [{
                token: [
                    "punctuation.definition.function.end.stringtemplate",
                    "punctuation.definition.delimiter.end.stringtemplate"
                ],
                regex: /(\s*\))(\s*>)/,
                next: "pop"
            }, {
                include: "#variable"
            }, {
                defaultToken: "meta.function.support.stringtemplate"
            }],
            comment: "Function calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /<\s*(?=\([^>]+\)\()/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*>/,
                next: "pop"
            }, {
                include: "#indirect-template"
            }, {
                defaultToken: "meta.function.template.indirect.stringtemplate"
            }],
            comment: "Indirect template calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /<\s*(?=[^>\.]+\()/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*>/,
                next: "pop"
            }, {
                include: "#template"
            }, {
                defaultToken: "meta.function.template.stringtemplate"
            }],
            comment: "Template calls"
        }, {
            token: [
                "punctuation.definition.delimiter.begin.stringtemplate",
                "keyword.control.stringtemplate",
                "punctuation.definition.delimiter.end.stringtemplate"
            ],
            regex: /(<\s*)(else|endif)(\s*>)/,
            comment: "Keyword calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /<\s*(?=[^>]+;)/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*>/,
                next: "pop"
            }, {
                include: "#angle-variable-options"
            }, {
                defaultToken: "meta.variable.other.options.stringtemplate"
            }],
            comment: "Variable with option calls"
        }, {
            token: "punctuation.definition.delimiter.begin.stringtemplate",
            regex: /<\s*/,
            push: [{
                token: "punctuation.definition.delimiter.end.stringtemplate",
                regex: /\s*>/,
                next: "pop"
            }, {
                include: "#variable"
            }, {
                defaultToken: "meta.variable.other.stringtemplate"
            }],
            comment: "Variable calls"
        }],
        "#angle-options": [{
            token: [
                "storage.modifier.option.stringtemplate",
                "punctuation.definition.equal.stringtemplate"
            ],
            regex: /(\s*(?:separator|format|null|wrap|anchor))(\s*=\s*)/,
            push: [{
                token: "punctuation.definition.comma.stringtemplate",
                regex: /\s*,|(?=\$)/,
                next: "pop"
            }, {
                include: "#expression"
            }, {
                defaultToken: "meta.storage.modifier.option.stringtemplate"
            }],
            comment: "Anonymous template"
        }],
        "#angle-variable-options": [{
            token: "punctuation.definition.semicolon.stringtemplate",
            regex: /\s*;\s*/,
            push: [{
                token: "meta.punctuation.definition.semicolon.stringtemplate",
                regex: /(?=\$)/,
                next: "pop"
            }, {
                include: "#angle-options"
            }, {
                defaultToken: "meta.punctuation.definition.semicolon.stringtemplate"
            }],
            comment: "Variable options"
        }, {
            include: "#variable"
        }],
        "#angle-variable-template": [{
            token: "punctuation.definition.template.call.stringtemplate",
            regex: /\s*:\s*(?=\()/,
            push: [{
                token: "meta.function.template.indirect.stringtemplate",
                regex: /(?=\$)/,
                next: "pop"
            }, {
                include: "#indirect-template"
            }, {
                defaultToken: "meta.function.template.indirect.stringtemplate"
            }],
            comment: "Indirect template call"
        }, {
            token: "punctuation.definition.template.call.stringtemplate",
            regex: /\s*:\s*/,
            push: [{
                token: "meta.function.template.stringtemplate",
                regex: /(?=\$)/,
                next: "pop"
            }, {
                include: "#template"
            }, {
                defaultToken: "meta.function.template.stringtemplate"
            }],
            comment: "Template call"
        }, {
            include: "#variable"
        }],
        "#argument-list": [{
            include: "#comma"
        }, {
            token: [
                "variable.parameter.stringtemplate",
                "punctuation.definition.equal.stringtemplate"
            ],
            regex: /([A-Za-z]\w*)(\s*=\s*)/,
            comment: "Argument"
        }, {
            include: "#expression"
        }],
        "#comma": [{
            token: "punctuation.definition.comma.stringtemplate",
            regex: /\s*,\s*/,
            comment: "Separator"
        }],
        "#expression": [{
            token: "punctuation.definition.string.begin.stringtemplate",
            regex: /"/,
            push: [{
                token: "punctuation.definition.string.end.stringtemplate",
                regex: /"/,
                next: "pop"
            }, {
                defaultToken: "string.quoted.double.stringtemplate"
            }],
            comment: "Quoted string"
        }, {
            token: "punctuation.definition.anonymous.begin.stringtemplate",
            regex: /\{/,
            push: [{
                token: "punctuation.definition.anonymous.end.stringtemplate",
                regex: /\}/,
                next: "pop"
            }, {
                include: "#expression-internal"
            }, {
                defaultToken: "meta.function.template.anonymous.stringtemplate"
            }],
            comment: "Anonymous template"
        }, {
            token: "punctuation.definition.concatenation.stringtemplate",
            regex: /\s*\+\s*/,
            comment: "Concatenation operator"
        }, {
            include: "#variable"
        }],
        "#expression-internal": [{
            include: "text.html.basic"
        }],
        "#indirect-template": [{
            token: "punctuation.definition.indirect.begin.stringtemplate",
            regex: /\(\s*/,
            push: [{
                token: "punctuation.definition.template.end.stringtemplate",
                regex: /\s*\)\s*(?=\()/,
                next: "pop"
            }, {
                include: "#expression"
            }, {
                defaultToken: "meta.function.template.indirect.expression.stringtemplate"
            }],
            comment: "Indirect template calls"
        }, {
            token: "punctuation.definition.template.begin.stringtemplate",
            regex: /\(/,
            push: [{
                token: "punctuation.definition.template.end.stringtemplate",
                regex: /\)/,
                next: "pop"
            }, {
                include: "#argument-list"
            }, {
                defaultToken: "meta.function.template.indirect.call.stringtemplate"
            }],
            comment: "Template calls"
        }],
        "#list": [{
            include: "#comma"
        }, {
            include: "#expression"
        }],
        "#template": [{
            token: [
                "entity.name.function.template.stringtemplate",
                "punctuation.definition.template.begin.stringtemplate"
            ],
            regex: /([A-Za-z]\w*(?:\/[A-Za-z]\w*)*)(\(\s*)/,
            push: [{
                token: [
                    "punctuation.definition.template.end.stringtemplate",
                    "punctuation.definition.comma.stringtemplate"
                ],
                regex: /(\))(\s*,?)/,
                next: "pop"
            }, {
                include: "#argument-list"
            }, {
                defaultToken: "meta.function.template.call.stringtemplate"
            }],
            comment: "Template calls"
        }],
        "#variable": [{
            token: "punctuation.definition.list.begin.stringtemplate",
            regex: /\[\s*/,
            push: [{
                token: "punctuation.definition.list.end.stringtemplate",
                regex: /\s*\]/,
                next: "pop"
            }, {
                include: "#list"
            }, {
                defaultToken: "meta.variable.other.list.stringtemplate"
            }],
            comment: "List creation"
        }, {
            token: "punctuation.definition.indirect.begin.stringtemplate",
            regex: /\(\s*/,
            push: [{
                token: "punctuation.definition.indirect.end.stringtemplate",
                regex: /\s*\)/,
                next: "pop"
            }, {
                include: "#expression"
            }, {
                defaultToken: "meta.variable.other.indirect.stringtemplate"
            }],
            comment: "Indirect property lookup"
        }, {
            token: "variable.other.stringtemplate",
            regex: /[\p{Lu}\p{Ll}\p{Lt}\p{Lm}\p{Lo}\p{Nl}_][\p{Lu}\p{Ll}\p{Lt}\p{Lm}\p{Lo}\p{Nl}\p{Nd}\p{Pc}\p{Mn}\p{Mc}\p{Cf}]*/,
            comment: "Variable"
        }, {
            token: "punctuation.definition.dot.stringtemplate",
            regex: /\./,
            comment: "Property operator"
        }]
    }
    
    this.normalizeRules();
};

StringTemplateHighlightRules.metaData = {
    name: "StringTemplate",
    scopeName: "text.stringtemplate",
    fileTypes: []
}


oop.inherits(StringTemplateHighlightRules, TextHighlightRules);

exports.StringTemplateHighlightRules = StringTemplateHighlightRules;
});
