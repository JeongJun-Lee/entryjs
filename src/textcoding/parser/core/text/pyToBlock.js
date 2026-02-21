/*
 *
 */
'use strict';

Entry.PyToBlockParser = class {
    constructor(blockSyntax) {
        this._type = 'PyToBlockParser';
        this.dic = blockSyntax['#dic'];
        this.blockSyntax = blockSyntax;

        this._funcParamMap = {};
        this._funcMap = {};

        this._isInFuncDef = false;

        this.util = Entry.TextCodingUtil;

        this.binaryOperator = {
            '==': 'EQUAL',
            '!=': 'NOT_EQUAL',
            '>': 'GREATER',
            '<': 'LESS',
            '>=': 'GREATER_OR_EQUAL',
            '<=': 'LESS_OR_EQUAL',
        };

        this.arithmeticOperator = {
            '+': 'PLUS',
            '-': 'MINUS',
            '*': 'MULTI',
            '/': 'DIVIDE',
        };

        this.divideOperator = {
            '//': 'QUOTIENT',
            '%': 'MOD',
        };

        this.logicalOperator = {
            '&&': 'AND',
            '||': 'OR',
        };
    }

    Programs(astArr) {
        try {
            return this.processPrograms(astArr);
        } catch (error) {
            throw error;
        }
    }

    raiseError({ title = '', message = '', line }) {
        throw { title, message, line };
    }

    processPrograms(astArr) {
        this.createFunctionMap();
        this._funcParamMap = {};
        this._isInFuncDef = false;
        const ws = Entry.playground.mainWorkspace;
        if (ws && !ws.board.code) {
            return [];
        }
        this.object = ws ? ws.board.code.object : Entry.playground.object;

        let result;
        if (!astArr[0]) {
            return [];
        }
        const astArrBody = astArr[0].body;
        const hasVariable =
            astArrBody &&
            astArrBody[0] &&
            astArrBody[0].type === 'ExpressionStatement' &&
            astArrBody[0].expression.type === 'AssignmentExpression';

        if (hasVariable) {
            const consumedCount = this.getVariables(astArr[0]);
            astArr[0].body.splice(0, consumedCount);
        }
        result = astArr.map(this.Node, this);

        return result.filter((t) => t.length > 0);
    }

    Program(component) {
        const thread = component.body.map((n) => {
            const result = this.Node(n);
            this.assert(typeof result === 'object', '', n, 'NO_SUPPORT', 'GENERAL');
            return result;
        }, this);
        if (thread.length > 0 && thread[0] && thread[0].constructor === Array) {
            return thread[0];
        } else {
            return thread;
        }
    }

    ExpressionStatement(component) {
        const expression = component.expression;
        const result = this.Node(expression);
        if (expression.comment) {
            result.comment = expression.comment;
        }

        return result;
    }

    CallExpression(component) {
        const callee = component.callee;
        const args = component.arguments;
        let obj = this.Node(callee);
        if (obj.type && component.callee.type === 'Identifier') {
            // Duplicate name with variable
            obj = callee.name;
        }

        if (typeof obj === 'string' && callee.type === 'MemberExpression') {
            if (this[obj]) {
                return this[obj](component);
            } else {
                this.raiseError({
                    message: Lang.TextCoding.message_conv_undefined_function,
                    line: callee.loc,
                });
            }
        }

        if (callee.type === 'Identifier') {
            // global function
            if (this._funcMap[obj]) {
                const funcType = this._funcMap[obj][args.length];
                obj = { type: `func_${funcType}` };
            } else if (this[obj]) {
                // special block like len
                return this[obj](component);
            } else {
                const blockInfo = this.blockSyntax[obj];
                this.assert(blockInfo && blockInfo.key, '', callee, 'NO_FUNCTION', 'GENERAL');
                obj = this.Block({}, blockInfo);
            }
        }

        if (obj.preParams) {
            component.arguments = obj.preParams.concat(component.arguments);
            delete obj.preParams;
        }

        if (component.arguments) {
            obj.params = this.Arguments(obj.type, component.arguments, obj.params);
        }

        if (obj.type === 'is_press_some_key') {
            if (!component.arguments[0]) {
                throw new Error(`keyboard input is empty`);
            }
            const value = component.arguments[0].value;
            if (!Entry.KeyboardCode.map[typeof value === 'string' ? value.toLowerCase() : value]) {
                throw new Error(`${value} is not supported key name`);
            }
            obj.params = [
                `${Entry.KeyboardCode.map[typeof value === 'string' ? value.toLowerCase() : value]
                }`,
            ];
        }

        return obj;
    }

    Identifier(component) {
        const name = component.name;

        if (this._isInFuncDef && this._funcParamMap[name]) {
            return {
                type: `stringParam_${this._funcParamMap[name]}`,
            };
        }

        if (this._isInFuncDef && this._localVariableMap && this._localVariableMap[name]) {
            return {
                type: 'get_func_variable',
                params: [this._localVariableMap[name]],
            };
        }

        const variable = Entry.variableContainer.getVariableByName(name);
        if (variable) {
            return {
                type: 'get_variable',
                params: [variable.id_],
            };
        }

        const list = Entry.variableContainer.getListByName(name);
        if (list) {
            return {
                type: 'get_list',
                params: [list.id_],
            };
        }
        return name;
    }

    VariableDeclaration(component) {
        const results = component.declarations.map(this.Node, this);

        return results;
    }

    VariableDeclarator(component) {
        if (component.init && component.init.arguments) {
            return component.init.arguments.map(this.Node, this);
        } else {
            return [];
        }
    }

    AssignmentExpression(component) {
        const lefts = Array.isArray(component.left) ? component.left : [component.left];
        const results = [];

        for (const i in lefts) {
            const result = { params: [] };
            const left = lefts[i];
            let leftVar;
            switch (left.type) {
                case 'MemberExpression':
                    result.type = 'change_value_list_index';
                    const leftName = left.object.name;
                    if (leftName === 'self') {
                        result.type = 'set_variable';
                        leftVar = Entry.variableContainer.getVariableByName(
                            left.property.name,
                            true,
                            this.object.id
                        );
                        if (!leftVar) {
                            Entry.variableContainer.addVariable({
                                variableType: 'variable',
                                name: left.property.name,
                                visible: true,
                                object: this.object.id,
                                value: 0,
                            });

                            leftVar = Entry.variableContainer.getVariableByName(
                                left.property.name,
                                true,
                                this.object.id
                            );
                        }

                        result.params.push(leftVar.id_);
                    } else {
                        leftVar = Entry.variableContainer.getListByName(leftName);
                        this.assert(leftVar, leftName, left.object, 'NO_LIST', 'LIST');
                        result.params.push(leftVar.id_);
                        result.params.push(this.ListIndex(this.Node(left.property.arguments[1])));
                    }
                    break;
                case 'Identifier':
                    if (this._isInFuncDef) {
                        leftVar = Entry.variableContainer.getVariableByName(left.name, false);
                        if (!leftVar) {
                            const localId = this.getOrCreateLocalVariable(left.name);
                            result.type = 'set_func_variable';
                            result.params.push(localId);
                            break;
                        }
                    }

                    result.type = 'set_variable';
                    leftVar = Entry.variableContainer.getVariableByName(left.name, false);
                    if (!leftVar) {
                        Entry.variableContainer.addVariable({
                            variableType: 'variable',
                            name: left.name,
                            visible: true,
                            value: 0,
                        });
                        leftVar = Entry.variableContainer.getVariableByName(left.name, false);
                    }
                    result.params.push(leftVar.id_);
                    break;
                default:
                    this.assert(false, 'error', left, 'NO_SUPPORT', 'GENERAL');
            }

            let rightHand = this.Node(component.right);

            switch (component.operator) {
                case '=':
                    break;
                case '+=':
                    if (result.type === 'set_variable') {
                        result.type = 'change_variable';
                        break;
                    }
                case '-=':
                case '/=':
                case '*=':
                default:
                    const operator = this.arithmeticOperator[component.operator[0]];
                    if (operator) {
                        let getBlock;
                        if (result.type === 'set_variable') {
                            getBlock = {
                                type: 'get_variable',
                                params: [leftVar.id_],
                            };
                        } else {
                            getBlock = {
                                type: 'value_of_index_from_list',
                                params: [
                                    undefined,
                                    leftVar.id_,
                                    undefined,
                                    this.ListIndex(this.Node(component.left.property.arguments[1])), // do not change this
                                ],
                            };
                        }
                        rightHand = {
                            type: 'calc_basic',
                            params: [getBlock, operator, rightHand],
                        };
                    }
            }
            result.params.push(rightHand);
            results.push(result);
        }

        return results;
    }

    Literal(component, paramSchema, paramDef) {
        const value = component.value;
        switch (typeof value) {
            case 'boolean':
                return { type: value ? 'True' : 'False' };
            default:
        }
        const paramType = paramSchema ? paramSchema.type : 'Block';
        switch (paramType) {
            case 'DropdownDynamic':
                return this.DropdownDynamic(value, paramSchema);
            case 'Block':
                if (paramDef && paramDef.type) {
                    // process primitive block
                    return {
                        type: paramDef.type,
                        params: this.Arguments(paramDef.type, [component]),
                    };
                }
                return {
                    type: 'number',
                    params: [this.getValue(component)],
                };
            default:
                return this.getValue(component);
        }
    }

    MemberExpression(component) {
        let obj;
        const result = {};
        if (component.object.name === 'self') {
            // local variable
            let localVar = Entry.variableContainer.getVariableByName(
                component.property.name,
                true,
                this.object.id
            );
            if (localVar) {
                return {
                    type: 'get_variable',
                    params: [localVar.id_],
                };
            }
            localVar = Entry.variableContainer.getListByName(
                component.property.name,
                true,
                this.object.id
            );
            if (localVar) {
                return {
                    type: 'get_list',
                    params: [localVar.id_],
                };
            }
            this.assert(localVar, 'variable not exist', component);
        } else if (component.object.type === 'Literal') {
            // string member
            obj = '%2';
            result.preParams = [component.object];
        } else {
            obj = this.Node(component.object);
        }

        if (typeof obj === 'object') {
            // list member
            if (obj.type === 'get_list') {
                result.preParams = [obj.params[0]];
            } else {
                result.preParams = [component.object];
            }
            obj = '%2';
        }
        const property = component.property;
        let blockInfo;

        if (property.type === 'CallExpression') {
            return this.SubscriptIndex(component);
        } else if (property.name === '_pySlice') {
            blockInfo = this.blockSyntax['%2[%4:%6]'];
        } else {
            const rawSyntax = `${obj}.${property.name}`;
            if (this.blockSyntax[obj] && this.blockSyntax[obj][property.name]) {
                if (this[rawSyntax]) {
                    return rawSyntax;
                }
                blockInfo = this.blockSyntax[obj][property.name];
            } else {
                return rawSyntax;
            } // block syntax not exist. pass to special
        }

        this.Block(result, blockInfo);

        return result;
    }

    WhileStatement(component) {
        this._loopDepth = (this._loopDepth || 0) + 1;
        const comment = component.body.comment;
        const blocks = component.body.body;
        const obj = {
            statements: [this.setParams(blocks)],
        };
        this._loopDepth--;
        const test = component.test;
        if (test.raw === 'True') {
            obj.type = 'repeat_inf';
        } else {
            obj.type = 'repeat_while_true';
            if (test.type === 'UnaryExpression' && test.operator === '!') {
                obj.params = [this.Node(component.test.argument), 'until'];
            } else {
                obj.params = [this.Node(component.test), 'while'];
            }
        }
        if (comment) {
            obj.comment = comment;
        }

        return obj;
    }

    BlockStatement(component) {
        let db = component.body.map(this.Node, this);

        if (db.constructor == Array && db[0].length) {
            if (db.length > 0) {
                db[db.length - 1][0].params.push(db[0][0][0]);
            }

            db = db[db.length - 1][0];
        }

        return db;
    }

    IfStatement(component) {
        let alternate;
        let blocks;

        const tempAlt = component.alternate;
        const isForState =
            tempAlt &&
            tempAlt.body &&
            tempAlt.body[0] &&
            'type' in tempAlt.body[0] &&
            tempAlt.body[0].type === 'ForInStatement';

        if (isForState) {
            alternate = component.alternate.body.map(this.Node, this);
            component.consequent.body[0].body.body.shift();

            blocks = component.consequent.body[0].body.body;
            alternate[0].statements.push(this.setParams(blocks));
        } else if (!('alternate' in component) || !component.alternate) {
            alternate = {
                type: '_if',
                statements: [this.setParams(component.consequent.body)],
                params: [this.Node(component.test)],
            };
        } else {
            const consequent = this.setParams(component.consequent.body);
            const alternates = this.setParams(component.alternate.body);
            alternate = {
                type: 'if_else',
                statements: [consequent, alternates],
                params: [this.Node(component.test)],
            };
        }

        if (component.consequent.comment) {
            alternate.comment = component.consequent.comment;
        }

        return alternate;
    }

    ForStatement(component) {
        const body = component.body.body;
        return this.Node(body[body.length - 1]);
    }

    ForInStatement(component) {
        this._loopDepth = (this._loopDepth || 0) + 1;
        // let  expression = component.body.body[0] && 'expression' in component.body.body[0] ?
        //                     this.Node(component.body.body[0].expression) : null;
        const result = {
            type: 'repeat_basic',
            params: [],
            statements: [],
        };
        this._loopDepth--;

        if (component.body.comment) {
            result.comment = component.body.comment;
        }

        return result;
    }

    BreakStatement(component) {
        return {
            type: this.blockSyntax.break.key,
        };
    }

    UnaryExpression(component) {
        switch (component.operator) {
            case '!':
                return {
                    type: 'boolean_not',
                    params: [undefined, this.Node(component.argument)],
                };
            case '-':
            case '+':
                const result = this.Node(component.argument);
                if (result.type === 'number') {
                    result.params = [component.operator + result.params[0]];
                    return result;
                } else {
                    return {
                        type: 'calc_basic',
                        params: [
                            {
                                type: 'number',
                                params: [`${component.operator}1`],
                            },
                            'MULTI',
                            result,
                        ],
                    };
                }
            default:
                throw new Error(`Unary operator ${component.operator} is not supported`);
        }
    }

    LogicalExpression(component) {
        return {
            type: 'boolean_and_or',
            params: [
                this.Node(component.left),
                this.logicalOperator[component.operator],
                this.Node(component.right),
            ],
        };
    }

    BinaryExpression(component) {
        let operator = component.operator;
        let blockType;
        if (this.binaryOperator[operator]) {
            blockType = 'boolean_basic_operator';
            operator = this.binaryOperator[operator];
        } else if (this.arithmeticOperator[operator]) {
            // nt11576 이슈 9429, 파이썬 변환시 Number add 와 String concat parsing 버그 수정
            if (
                typeof component.left.value === 'string' ||
                typeof component.right.value === 'string'
            ) {
                return {
                    type: 'combine_something',
                    params: [
                        undefined,
                        this.Node(component.left),
                        undefined,
                        this.Node(component.right),
                        undefined,
                    ],
                };
            } else {
                blockType = 'calc_basic';
                operator = this.arithmeticOperator[operator];
            }
        } else if (this.divideOperator[operator]) {
            return {
                type: 'quotient_and_mod',
                params: [
                    undefined,
                    this.Node(component.left),
                    undefined,
                    this.Node(component.right),
                    undefined,
                    this.divideOperator[operator],
                ],
            };
        } else if (operator === '**') {
            this.assert(
                component.right.value === 2,
                component.right.value,
                component,
                'DEFAULT',
                'DEFAULT'
            );
            return {
                type: 'calc_operation',
                params: [undefined, this.Node(component.left), undefined, 'square'],
            };
        } else {
            throw new Error(`Not supported operator ${component.operator}`);
        }
        return {
            type: blockType,
            params: [this.Node(component.left), operator, this.Node(component.right)],
        };
    }

    // UpdateExpression(component) {};

    FunctionDeclaration(component) {
        const startBlock = {};

        const funcName = component.id.name;
        this.assert(!this._isInFuncDef, funcName, component, 'NO_ENTRY_EVENT_FUNCTION', 'FUNCTION');

        this._isInFuncDef = true;
        this._localVariableMap = {};
        this._funcParamMap = {};
        this.assert(component.body.body[0], funcName, component, 'NO_OBJECT', 'OBJECT');

        if (funcName === 'when_press_key') {
            if (!component.arguments || !component.arguments[0]) {
                throw new Error(`keyboard input is empty`);
                // startBlock.params = [null, null];
            } else {
                const value = component.arguments[0].name;
                if (
                    !Entry.KeyboardCode.map[typeof value === 'string' ? value.toLowerCase() : value]
                ) {
                    throw new Error(`${value} is not supported key name`);
                }
                startBlock.params = [
                    null,
                    `${Entry.KeyboardCode.map[
                    typeof value === 'string' ? value.toLowerCase() : value
                    ]
                    }`,
                ];
            }
        }

        if (funcName === 'when_get_signal') {
            if (!component.arguments || !component.arguments[0]) {
                startBlock.params = [null, null];
            } else {
                startBlock.params = [null, this.getMessage(component.arguments[0].name)];
            }
        }

        const blockStatement = component.body.body[0].argument.callee.object.body;
        const comment = blockStatement.comment;
        const blocks = blockStatement.body;
        const blockInfo = this.blockSyntax[`def ${funcName}`];

        if (blockInfo) {
            // event block
            startBlock.type = blockInfo.key;
            if (comment) {
                startBlock.comment = comment;
            }

            this._isInFuncDef = false; // Event blocks should use global scope
            const definedBlocks = this.setParams(blocks);
            this._isInFuncDef = true; // Restore for cleanup
            definedBlocks.unshift(startBlock);

            this._isInFuncDef = false;
            return definedBlocks;
        } else {
            this.createFunction(component, funcName, blocks);
            this._isInFuncDef = false;
            return [];
        }
    }

    FunctionExpression(component) {
        return this.Node(component.body);
    }

    ReturnStatement(component) {
        if (this._isInFuncDef && this._isCurrentFuncValue && this._funcResultVarId) {
            const resultVarId = this._funcResultVarId;
            const valueBlock = component.argument ? this.Node(component.argument) : { type: 'text', params: ['None'] };
            const setVarBlock = {
                type: 'set_func_variable',
                params: [resultVarId, valueBlock, null],
            };

            if (this._loopDepth > 0) {
                const stopBlock = {
                    type: 'stop_object',
                    params: ['thisThread', null],
                };
                return [setVarBlock, stopBlock];
            }
            return setVarBlock;
        }

        if (component.argument) {
            if (component.argument.arguments && Array.isArray(component.argument.arguments)) {
                return component.argument.arguments.map(this.Node, this);
            }
            return this.Node(component.argument);
        }
        return [];
    }

    // ThisExpression(component) {};

    NewExpression(component) {
        return this.Node(component.callee);
    }

    SubscriptIndex(component) {
        const obj = this.Node(component.object);
        let blockInfo;

        if (obj.type === 'get_list') {
            // string
            blockInfo = this.blockSyntax['%2[%4]'];
        } else {
            // var, list
            blockInfo = this.blockSyntax['%2[%4]#char_at'];
        }
        const result = this.Block({}, blockInfo);
        result.params = this.Arguments(result.type, component.property.arguments);
        return result;
    }

    Comment(component) {
        return {
            type: 'comment',
            value: component.value,
        };
    }

    /**
     * util Function
     */

    Arguments(blockType, args, defaultParams) {
        let defParams;
        let sortedArgs;
        let blockSchema;
        blockSchema = Entry.block[blockType];
        if ((blockType && blockType.substr(0, 5) === 'func_') || !blockSchema) {
            // function block, etc
            sortedArgs = args;
        } else {
            const syntax = this.PySyntax(blockSchema, defaultParams);
            const indexes = syntax.match(/%\d+/g, '');
            if (!indexes) {
                return defaultParams || [];
            }
            sortedArgs = defaultParams || [];

            for (let i = 0; i < indexes.length; i++) {
                const idx = parseInt(indexes[i].substring(1)) - 1;
                sortedArgs[idx] = args[i];
            }
            defParams =
                blockSchema.def && blockSchema.def.params ? blockSchema.def.params : undefined;
        }
        let results = sortedArgs.map((arg, index) => {
            if (arg && arg.type) {
                const paramSchema = blockSchema ? blockSchema.params[index] : null;
                let param = this.Node(
                    arg,
                    arg.type === 'Literal' ? paramSchema : undefined,
                    arg.type === 'Literal' && defParams ? defParams[index] : undefined
                );
                this.assert(
                    !(typeof param === 'string' && arg.type === 'Identifier'),
                    param,
                    arg,
                    'NO_VARIABLE',
                    'VARIABLE'
                );

                if (paramSchema && paramSchema.type !== 'Block' && param && param.params) {
                    // for list and variable dropdown
                    param = param.params[0];
                } else if (paramSchema && paramSchema.type === 'Block' && paramSchema.isListIndex) {
                    param = this.ListIndex(param);
                }

                return param;
            } else {
                return arg;
            } // default params
        }, this);

        const codeMap = this.CodeMap(blockType);
        if (codeMap) {
            results = results.map((arg, index) => {
                if (codeMap[index] && arg) {
                    return codeMap[index][this.toLowerCase(arg)] || arg;
                } else {
                    return arg;
                }
            }, this);
        }

        return results;
    }

    getValue(component) {
        let value;
        if (component.type === 'Literal') {
            value = component.raw;
            if (value === 'None') {
                return;
            } else if (component.value === undefined) {
                value = 0;
            } else if (!component.value) {
                value = component.value;
            } else if (component.value.constructor === String) {
                if (component.raw.includes('"') || component.raw.includes("'")) {
                    value = component.raw.substr(1, component.raw.length - 2);
                } else {
                    value = component.raw;
                }
            } else if (component.value.constructor === Number) {
                value = component.value;
            }

            return value;
        } else {
            value = this.Node(component);
            return value.params && value.params[0] ? value.params[0] : null;
        }
    }

    getMessage(name) {
        if (!name) {
            return;
        }
        name = name.replace(/_space_/gi, ' ');

        let objects = Entry.variableContainer.messages_.filter((obj) => obj.name === name);

        if (objects.length <= 0) {
            Entry.variableContainer.addMessage({
                name,
            });
            objects = Entry.variableContainer.messages_.filter((obj) => obj.name === name);
        }

        let object;
        if (objects && objects.length > 0) {
            object = objects[0].id;
        } else {
            object = name;
        }

        return object;
    }

    DropdownDynamic(value, paramSchema) {
        if (_.isFunction(paramSchema.menuName)) {
            return value;
        }
        let object;
        let objects;
        switch (paramSchema.menuName) {
            case 'sprites':

            case 'spritesWithMouse':
                objects = Entry.container.objects_.filter((obj) => obj.name === value);

                if (objects && objects.length > 0) {
                    object = objects[0].id;
                } else {
                    object = value;
                }

                return object;

            case 'spritesWithSelf':
                if (!value) {
                    object = 'None';
                } else if (value == 'self') {
                    object = value;
                } else {
                    objects = Entry.container.objects_.filter((obj) => obj.name === value);

                    object = objects[0].id;
                }

                return object;
            case 'collision':
                objects = Entry.container.objects_.filter((obj) => obj.name === value);

                if (objects && objects.length > 0) {
                    object = objects[0].id;
                } else {
                    object = value;
                }

                return object;

            case 'pictures':
                const picture = this.object.getPicture(value);
                return picture ? picture.id : undefined;
            case 'messages':
                return this.getMessage(value);
            case 'variables':
                if (!value) {
                    return;
                }
                value = value.split('.');
                let variable;
                if (value.length > 1) {
                    // self variable
                    variable = Entry.variableContainer.getVariableByName(
                        value[1],
                        true,
                        this.object.id
                    );
                } else {
                    variable = Entry.variableContainer.getVariableByName(
                        value[0],
                        false,
                        this.object.id
                    );
                }
                return variable ? variable.id_ : undefined;
            case 'lists':
                if (!value) {
                    return;
                }
                value = value.split('.');
                let list;
                if (value.length > 1) {
                    // self variable
                    list = Entry.variableContainer.getListByName(value[1], true, this.object.id);
                } else {
                    list = Entry.variableContainer.getListByName(value[0], false, this.object.id);
                }
                return list ? list.id_ : undefined;
            case 'scenes':
                const scenes = Entry.scene.scenes_.filter((s) => s.name === value);
                return scenes[0] ? scenes[0].id : undefined;
            case 'sounds':
                if (!value) {
                    return undefined;
                }
                const sound = this.object.getSound(value);
                return sound ? sound.id : undefined;
            case 'clone':
            case 'textBoxWithSelf':
                let object;

                if (!value) {
                    object = null;
                } else if (value == 'self') {
                    object = value;
                } else {
                    const objects = Entry.container.objects_.filter((obj) => obj.name === value);

                    object = objects[0] ? objects[0].id : null;
                }

                return object;
            case 'fonts':
                return EntryStatic.fonts.find(({ family }) => family === value).family;
            case 'objectSequence':
            case 'blockCount':
                return value;
        }
    }

    Node(nodeType, node) {
        let hasType = false;
        if (typeof nodeType === 'string' && nodeType !== node.type) {
            this.assert(
                false,
                node.name || node.value || node.operator,
                node,
                'NO_SUPPORT',
                'GENERAL'
            );
        } else if (typeof nodeType === 'string') {
            hasType = true;
        }

        const args = Array.prototype.slice.call(arguments);
        if (hasType) {
            args.shift();
        }

        node = args[0];

        if (!this[node.type]) {
            throw new Error(`${node.type} is not supported`);
        }
        return this[node.type].apply(this, args);
    }

    PySyntax(blockSchema, defaultParams) {
        if (defaultParams) {
            const syntaxes = blockSchema.syntax.py.filter((s) => {
                if (!s.params) {
                    return false;
                }
                let isSame = true;
                s.params.map((p, index) => {
                    if (p != defaultParams[index]) {
                        isSame = false;
                    }
                });
                return isSame;
            });
            if (syntaxes.length) {
                return syntaxes[0].syntax;
            }
        }
        const syntaxObj = blockSchema.syntax.py[0];
        return syntaxObj.syntax || syntaxObj;
    }

    CodeMap(blockType) {
        for (const objName in Entry.CodeMap) {
            if (Entry.CodeMap[objName] && Entry.CodeMap[objName][blockType]) {
                return Entry.CodeMap[objName][blockType];
            }
        }
    }

    Block(result, blockInfo) {
        result.type = blockInfo.key;

        if (blockInfo.params) {
            result.params = blockInfo.params.concat();
        }
        return result;
    }

    ListIndex(param) {
        if (this.isParamPrimitive(param)) {
            // literal
            param.params = [Number(param.params[0]) + 1];
        } else if (
            param.type === 'calc_basic' && // x - 1
            param.params[1] === 'MINUS' &&
            this.isParamPrimitive(param.params[2]) &&
            `${param.params[2].params[0]}` === '1'
        ) {
            param = param.params[0];
        } else {
            param = {
                type: 'calc_basic',
                params: [
                    param,
                    'PLUS',
                    {
                        type: 'text',
                        params: ['1'],
                    },
                ],
            };
        }
        return param;
    }

    isParamPrimitive(param) {
        return param && (param.type === 'number' || param.type === 'text');
    }

    assert(data, keyword, errorNode, message, subject) {
        if (data) {
            return;
        }
        Entry.TextCodingError.error(
            Entry.TextCodingError.TITLE_CONVERTING,
            Entry.TextCodingError[`MESSAGE_CONV_${message || 'NO_SUPPORT'}`],
            keyword,
            errorNode.loc,
            Entry.TextCodingError[`SUBJECT_CONV_${subject || 'GENERAL'}`]
        );
    }

    setParams(params) {
        if (!params || params.length === 0) {
            return [];
        }

        const definedBlocks = [];
        for (let i = 0; i < params.length; i++) {
            const n = params[i];

            if (n.type === 'ReturnStatement') {
                const result = this.Node(n);
                if (Array.isArray(result)) {
                    definedBlocks.push(...result);
                } else {
                    definedBlocks.push(result);
                }
                break; // Unreachable code after direct return
            }

            if (n.type === 'IfStatement' && this.hasReturnStatement(n.consequent)) {
                if (i < params.length - 1) {
                    const rest = params.slice(i + 1);
                    if (!n.alternate) {
                        n.alternate = {
                            type: 'BlockStatement',
                            body: rest,
                        };
                        const result = this.Node(n);
                        definedBlocks.push(Array.isArray(result) ? result[0] : result);
                        break;
                    } else if (n.alternate.type === 'BlockStatement') {
                        n.alternate.body = n.alternate.body.concat(rest);
                        const result = this.Node(n);
                        definedBlocks.push(Array.isArray(result) ? result[0] : result);
                        break;
                    }
                }
            }

            const result = this.Node(n);
            if (result) {
                if (Array.isArray(result)) {
                    definedBlocks.push(...result);
                } else {
                    definedBlocks.push(result);
                }
            }
        }

        const results = [];
        for (let i = 0; i < definedBlocks.length; i++) {
            const db = definedBlocks[i];

            if (Array.isArray(db)) {
                results = results.concat(db);
            } else {
                results.push(db);
            }
        }

        return results.filter((b) => b && b.constructor === Object);
    }

    getVariables(program) {
        const nodes = program.body;
        let count = 0;

        for (let i = 0; i < nodes.length; i++) {
            let n = nodes[i];
            if (n.type !== 'ExpressionStatement' || n.expression.type !== 'AssignmentExpression') {
                break;
            }
            n = n.expression;
            let left = n.left;
            const right = n.right;
            let name;
            let type = 'variables_';
            const id = Entry.generateHash();
            let value;
            let array;

            if (n.operator != '=') {
                break;
            }

            if (right.type === 'NewExpression' && right.callee.property.name == 'list') {
                type = 'lists_';
                let temp = right.arguments.map(this.Node, this);

                temp = temp.map((m) => {
                    if (m.constructor === Object && 'params' in m) {
                        return {
                            data:
                                typeof m.params[0] === 'string'
                                    ? m.params[0].replace(/\\\"/gi, '"')
                                    : m.params[0],
                        };
                    } else {
                        return { data: m };
                    }
                });

                array = temp;
            } else {
                value = this.getValue(right);
            }

            const functionType = `add${type[0].toUpperCase()}${type.slice(1, type.length - 2)}`;

            if (!Array.isArray(left)) {
                left = [left];
            }

            for (const key in left) {
                let object = false;
                const l = left[key];

                const obj = {
                    variableType: 'variable',
                    name: '',
                    visible: true,
                    object: {},
                    value: '',
                };
                if (array) {
                    obj.array = array;
                }
                if (value) {
                    obj.value = value;
                }

                if ('name' in l) {
                    name = l.name;
                } else {
                    object = this.object;
                    name = l.property.name;
                    object = object.id;
                }

                const existVar = this.variableExist(name, type);

                if (existVar) {
                    if (type == 'lists_') {
                        existVar.array_ = obj.array;
                    } else {
                        existVar.value_ = this.getValue(right);
                    }
                } else {
                    obj.variableType = type.slice(0, type.length - 2);
                    obj.name = name;
                    obj.object = object;
                    Entry.variableContainer[functionType](obj);
                }
            }
            count++;
        }

        return count;
    }

    variableExist(name, type) {
        let variables_ = Entry.variableContainer[type];
        variables_ = variables_.map((v) => v.name_);

        if (variables_.indexOf(name) > -1) {
            return Entry.variableContainer[type][variables_.indexOf(name)];
        }
        return false;
    }

    /**
     * Special Blocks
     */

    len(component) {
        const param = this.Node(component.arguments[0]);
        this.assert(
            !(typeof param === 'string' && component.arguments[0].type === 'Identifier'),
            param,
            component.arguments[0],
            'NO_VARIABLE',
            'VARIABLE'
        );

        if (param.type === 'get_list') {
            // string len
            return {
                type: 'length_of_list',
                params: [undefined, param.params[0]],
            };
        } else {
            // array len
            return {
                type: 'length_of_string',
                params: [undefined, param],
            };
        }
    }

    ['Hamster.note'](component) {
        let blockInfo;
        if (component.arguments.length > 2) {
            blockInfo = this.blockSyntax.Hamster.note;
        } else {
            blockInfo = this.blockSyntax.Hamster['note#0'];
            component.arguments.shift();
        }
        const obj = this.Block({}, blockInfo);
        obj.params = this.Arguments(blockInfo.key, component.arguments);
        if (component.arguments.length > 2) {
            obj.params[0] =
                Entry.CodeMap.Hamster.hamster_play_note_for[0][this.toLowerCase(obj.params[0])];
        }
        return obj;
    }

    ['Hamster.line_tracer_mode'](component) {
        return this.Special(component, 'Hamster', 'line_tracer_mode');
    }

    ['Hamster.io_mode_a'](component) {
        return this.Special(component, 'Hamster', 'io_mode_a');
    }

    ['Hamster.io_mode_b'](component) {
        return this.Special(component, 'Hamster', 'io_mode_b');
    }

    ['Hamster.io_modes'](component) {
        return this.Special(component, 'Hamster', 'io_modes');
    }

    ['Hamster.leds'](component) {
        return this.Special(component, 'Hamster', 'leds');
    }

    ['Hamster.left_led'](component) {
        return this.Special(component, 'Hamster', 'left_led');
    }

    ['Hamster.right_led'](component) {
        return this.Special(component, 'Hamster', 'right_led');
    }

    ['__pythonRuntime.ops.in'](component) {
        // "10 in list"
        return {
            type: 'is_included_in_list',
            params: this.Arguments('is_included_in_list', component.arguments),
        };
    }

    Special(component, name, key) {
        const result = {};
        let param = this.Node(component.arguments[0]);
        if (this.isParamPrimitive(param)) {
            param = param.params[0];
        }
        const blockInfo = this.blockSyntax[name][`${key}(${param})`];

        this.Block(result, blockInfo);
        return result;
    }

    createFunctionMap() {
        this._funcMap = {};
        const functions = Entry.variableContainer.functions_;
        for (const key in functions) {
            const funcSchema = Entry.block[`func_${key}`];
            const funcName = funcSchema.template
                .trim()
                .split(' ')[0]
                .trim();
            if (!this._funcMap[funcName]) {
                this._funcMap[funcName] = {};
            }
            this._funcMap[funcName][funcSchema.params.length - 1] = key;
        }
    }

    createFunction(component, funcName, blocks) {
        const params = component.arguments ? component.arguments.map(this.Node, this) : [];
        const functions = Entry.variableContainer.functions_;

        let funcId = Entry.generateHash();
        for (const key in functions) {
            const funcSchema = Entry.block[`func_${key}`];
            const funcEntry = functions[key];
            const expectedLength = funcEntry.type === 'value' ? params.length : params.length + 1;
            if (
                funcSchema.params.length === expectedLength &&
                funcSchema.template
                    .trim()
                    .split(' ')[0]
                    .trim() === funcName
            ) {
                funcId = key;
                break;
            }
        }

        this._currentFuncId = funcId;
        this._localVariableMap = {};
        this._collectedLocalVariables = [];

        let returnStatement = null;
        if (blocks.length > 0) {
            const lastBlock = blocks[blocks.length - 1];
            if (lastBlock.type === 'ReturnStatement') {
                returnStatement = lastBlock;
                blocks.pop();
            }
        }

        const hasNestedReturn = this.hasReturnStatement(blocks);
        const isValueFunc = !!returnStatement || hasNestedReturn;
        this._isCurrentFuncValue = isValueFunc;
        this._funcResultVarId = null;

        if (isValueFunc && hasNestedReturn) {
            this._funcResultVarId = this.getOrCreateLocalVariable('result');
            if (returnStatement) {
                blocks.push(returnStatement);
                returnStatement = null;
            }
        }

        //함수 선언 블록 내 값블록
        let funcParamPointer = {
            type: 'function_field_label',
            params: [funcName],
        };
        const funcParamStartPointer = funcParamPointer;
        const paramLength = params.length;

        while (params.length) {
            // generate param
            const param = params.shift();
            let paramId = Entry.Func.requestParamBlock('string');
            const newFuncParam = {
                type: 'function_field_string',
                params: [
                    {
                        type: paramId,
                    },
                ],
            };
            paramId = paramId.split('_')[1];
            this._funcParamMap[param] = paramId;
            funcParamPointer.params.push(newFuncParam);
            funcParamPointer = newFuncParam;
        }

        const definedBlocks = this.setParams(blocks); // function content
        this._funcParamMap = {};

        if (isValueFunc && hasNestedReturn) {
            // Initialize result variable to None at the start
            const initBlock = {
                type: 'set_func_variable',
                params: [this._funcResultVarId, { type: 'text', params: ['None'] }, null],
            };
            definedBlocks.unshift(initBlock);
        }

        let returnValueBlock = null;
        if (this._funcResultVarId) {
            returnValueBlock = {
                type: 'get_func_variable',
                params: [this._funcResultVarId],
            };
        } else if (returnStatement && returnStatement.argument) {
            returnValueBlock = this.Node(returnStatement.argument);
        }

        //함수 선언 블록
        const funcDeclarationContent = {
            type: returnValueBlock ? 'function_create_value' : 'function_create',
            params: returnValueBlock
                ? [funcParamStartPointer, null, null, returnValueBlock]
                : [funcParamStartPointer],
        };

        const func = {
            id: funcId,
            type: returnValueBlock ? 'value' : 'normal',
            content: [[funcDeclarationContent]],
            localVariables: this._collectedLocalVariables,
            useLocalVariables: this._collectedLocalVariables.length > 0,
        };

        // 함수 선언 블록에 달린 코멘트 처리
        const comment = component.body.body[0].argument.callee.object.body.comment;
        if (comment) {
            funcDeclarationContent.comment = comment;
        }

        if (!this._funcMap[funcName]) {
            this._funcMap[funcName] = {};
        }
        this._funcMap[funcName][paramLength] = func.id;

        funcDeclarationContent.statements = [definedBlocks];
        func.content = JSON.stringify(func.content);

        if (functions[funcId]) {
            const targetFunc = functions[funcId];
            targetFunc.localVariables = func.localVariables;
            targetFunc.useLocalVariables = func.useLocalVariables;
            targetFunc.type = func.type;
            targetFunc.content = new Entry.Code(func.content);
            targetFunc.generateBlock(true);
            Entry.Func.generateWsBlock(targetFunc);
        } else {
            Entry.variableContainer.setFunctions([func]);
        }

        this._isCurrentFuncValue = false;
        this._funcResultVarId = null;
    }

    hasReturnStatement(nodes) {
        if (!nodes) {
            return false;
        }

        let body;
        if (Array.isArray(nodes)) {
            body = nodes;
        } else if (nodes.type === 'BlockStatement') {
            body = nodes.body;
        } else if (nodes.body) {
            return this.hasReturnStatement(nodes.body);
        } else {
            body = [nodes];
        }

        for (const n of body) {
            if (n.type === 'ReturnStatement') {
                return true;
            }
            if (n.consequent && this.hasReturnStatement(n.consequent)) {
                return true;
            }
            if (n.alternate && this.hasReturnStatement(n.alternate)) {
                return true;
            }
            if (n.body && this.hasReturnStatement(n.body)) {
                return true;
            }
        }
        return false;
    }

    getOrCreateLocalVariable(name) {
        if (!this._localVariableMap) {
            this._localVariableMap = {};
            this._collectedLocalVariables = [];
        }
        let localId = this._localVariableMap[name];
        if (!localId) {
            localId = `${this._currentFuncId}_${Entry.generateHash()}`;
            this._localVariableMap[name] = localId;
            this._collectedLocalVariables.push({
                name: name,
                id: localId,
            });
        }
        return localId;
    }

    /**
     * Not Supported
     */

    ClassDeclaration(component) {
        const funcName = this.Node(component.id);
        this.assert(false, funcName, component, 'NO_OBJECT', 'OBJECT');
    }

    // RegExp(component) {};

    // Function(component) {};

    // EmptyStatement(component) {};

    // DebuggerStatement(component) {};

    // WithStatement(component) {};

    // LabeledStatement(component) {};

    // ContinueStatement(component) {};

    // SwitchStatement(component) {};

    // SwitchCase(component) {};

    // ThrowStatement(component) {};

    // TryStatement(component) {};

    // CatchClause(component) {};

    // DoWhileStatement(component) {
    //     return component.body.map(this.Node,  this);
    // };

    // ArrayExpression(component) {};

    // ObjectExpression(component) {};

    // Property(component) {};

    // ConditionalExpression(component) {};

    // SequenceExpression(component) {};

    searchSyntax(datum) {
        //legacy
        let schema;
        let appliedParams;
        let doNotCheckParams = false;

        if (datum instanceof Entry.BlockView) {
            schema = datum.block._schema;
            appliedParams = datum.block.data.params;
        } else if (datum instanceof Entry.Block) {
            schema = datum._schema;
            appliedParams = datum.params;
        } else {
            schema = datum;
            doNotCheckParams = true;
        }

        if (schema && schema.syntax) {
            const syntaxes = schema.syntax.py.concat();
            while (syntaxes.length) {
                let isFail = false;
                const syntax = syntaxes.shift();
                if (typeof syntax === 'string') {
                    return { syntax, template: syntax };
                }
                if (syntax.params) {
                    for (let i = 0; i < syntax.params.length; i++) {
                        if (
                            doNotCheckParams !== true &&
                            syntax.params[i] &&
                            syntax.params[i] !== appliedParams[i]
                        ) {
                            isFail = true;
                            break;
                        }
                    }
                }
                if (!syntax.template) {
                    syntax.template = syntax.syntax;
                }
                if (isFail) {
                    continue;
                }
                return syntax;
            }
        }
        return null;
    }

    toLowerCase(data) {
        if (data && data.toLowerCase) {
            return data.toLowerCase();
        } else {
            return data;
        }
    }
};
