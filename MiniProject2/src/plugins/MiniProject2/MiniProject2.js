/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Sat Oct 15 2016 20:02:21 GMT-0500 (Central Daylight Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'text!./Templates/index.html',
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase,
    indexHtmlContent) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of MiniProject2.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin MiniProject2.
     * @constructor
     */
    var MiniProject2 = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    MiniProject2.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    MiniProject2.prototype = Object.create(PluginBase.prototype);
    MiniProject2.prototype.constructor = MiniProject2;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */

    MiniProject2.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            artifact,
            nodeObject;


        // Using the logger.
        //self.logger.debug('This is a debug message.');
        //self.logger.info('This is an info message.');
        //self.logger.warn('This is a warning message.');
        self.logger.error('This is an entry message.');

        // Using the coreAPI to make changes.

        /*nodeObject = self.activeNode;1

        self.core.setAttribute(nodeObject, 'name', 'My new obj');
        self.core.setRegistry(nodeObject, 'position', {x: 70, y: 70});*/


        // This will save the changes. If you don't want to save;
        // exclude self.save and call callback directly from this scope.
        /*self.save('MiniProject2 updated model.')
            .then(function () {
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                // Result success is false at invocation.
                callback(err, self.result);
            });*/

        self.extractDataModel(self.rootNode)
            .then(function (nodes) {

                //self.logger.info(Object.keys(nodes));
                var dataModel = self.printChildrenRec(self.rootNode, nodes);
                var dataModelStr = JSON.stringify(dataModel, null, 4);
                self.dataModel = dataModel;

                artifact = self.blobClient.createArtifact('data');
                self.logger.info('**************Extracted dataModel****************', dataModelStr);

                var array_new = self.toArray(nodes);
                var array_new_str = JSON.stringify(array_new, null, 4);
                self.logger.info('*************Array Info*************',array_new_str);

                return artifact.addFile('tree.json',dataModelStr);
                //return artifact.addFile('meta.json',array_new_str);

            })
            .then(function (fileHash) {
                self.result.addArtifact(fileHash);
                return artifact.save()
            })
            .then(function (artifactHash) {
                self.result.addArtifact(artifactHash);
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                self.logger.error(err.stack);
                // Result success is false at invocation.
                callback(err, self.result);
            }) ;
    };

    MiniProject2.prototype.extractDataModel = function (node) {
        var self = this;
        return self.core.loadSubTree(node)
            .then(function (nodeArr) {
                var nodes = {},
                    i;
                for (i = 0; i < nodeArr.length; i += 1) {
                    nodes[self.core.getPath(nodeArr[i])] = nodeArr[i];
                }
                return nodes;
            });
    };

    MiniProject2.prototype.toArray = function (nodes) {
        var self = this,
            path,
            name,
            node,
            nbrOfChildren,
            arr= [];

        for (path in nodes) {
            node = nodes[path];
            if(self.getMetaType(node) === node)
            {
                var details ='';
                name = self.core.getAttribute(node,'name');
                details = details.concat('name :',name);

                path = self.core.getPath(node);
                details = details.concat(' ,path :',path);

                nbrOfChildren = self.core.getChildrenPaths(node).length;
                details = details.concat(' , nbrOfChildren :',nbrOfChildren);
                arr.push(details);

                //self.logger.info(arr);
            }
        }
        return arr;
    };

    MiniProject2.prototype.printChildrenRec = function (root, nodes, indent) {
        var self = this,
            childrenPaths,
            childNode,
            name,
            attr,
            i,
            metaNode,
            dataModel = {
            EntityRelationship: {
                name: '',
                children: [],
                isMeta: '',
                metaType: '',
                guard: '',
                src: '',
                dst: ''
            }
        };


        indent = indent || '';

        childrenPaths = self.core.getChildrenPaths(root);

        self.logger.info(indent,'Name :',self.core.getAttribute(root, 'name'),',');
        dataModel.EntityRelationship.name = self.core.getAttribute(root, 'name');
        if(root!=self.rootNode) {
            if (self.getMetaType(root) === root) {
                self.logger.info(indent, 'isMeta : true,');
                dataModel.EntityRelationship.isMeta = 'true';
            }
            else {
                self.logger.info(indent, 'isMeta : false,');
                dataModel.EntityRelationship.isMeta = 'false';
            }

            metaNode = self.getMetaType(root);
            self.logger.info(indent, 'Meta-type: ', self.core.getAttribute(metaNode, 'name'));
            dataModel.EntityRelationship.metaType = self.core.getAttribute(metaNode, 'name');


            if (self.isMetaTypeOf(root, self.META.Transition)) {
                attr = self.core.getAttribute(root, 'guard');
                self.logger.info(indent, 'guard:', attr, ',');
                dataModel.EntityRelationship.guard = attr;

                var srcPath = self.core.getPointerPath(root, 'src');
                var dstPath = self.core.getPointerPath(root, 'dst');

                // Pathes are always non-empty strings (expect for the rootNode which
                // cannot be the target of a pointer) and non-empty strings are "truthy"..
                if (srcPath && dstPath) {
                    var srcNode = nodes[srcPath];
                    var dstNode = nodes[dstPath];
                    self.logger.info(indent, 'src: ', self.core.getAttribute(srcNode, 'name'), ',');
                    dataModel.EntityRelationship.src = self.core.getAttribute(srcNode, 'name');
                    self.logger.info(indent, 'dst: ', self.core.getAttribute(dstNode, 'name'), ',');
                    dataModel.EntityRelationship.dst = self.core.getAttribute(dstNode, 'name');
                }
            }
        }
        if(childrenPaths.length>0)
            self.logger.info(indent,'Children');

        for (i = 0; i < childrenPaths.length; i += 1) {
            childNode = nodes[childrenPaths[i]];
            if(childrenPaths.length>0)
                self.logger.info(indent,' {');
            dataModel.EntityRelationship.children.push(self.printChildrenRec(childNode, nodes, indent + '  '));
            self.logger.info(indent,'}');
        }
        return dataModel;
    };
    return MiniProject2;
});