(window.webpackJsonp=window.webpackJsonp||[]).push([[54],{1610:function(e,n,t){"use strict";t.r(n),t.d(n,"setupMode",(function(){return Te}));var r=12e4,i=function(){function e(e){var n=this;this._defaults=e,this._worker=null,this._idleCheckInterval=setInterval((function(){return n._checkIfIdle()}),3e4),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange((function(){return n._stopWorker()}))}return e.prototype._stopWorker=function(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null},e.prototype.dispose=function(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()},e.prototype._checkIfIdle=function(){var e;this._worker&&(Date.now()-this._lastUsedTime>12e4&&this._stopWorker())},e.prototype._getClient=function(){return this._lastUsedTime=Date.now(),this._client||(this._worker=monaco.editor.createWebWorker({moduleId:"vs/language/css/cssWorker",label:this._defaults.languageId,createData:{languageSettings:this._defaults.diagnosticsOptions,languageId:this._defaults.languageId}}),this._client=this._worker.getProxy()),this._client},e.prototype.getLanguageServiceWorker=function(){for(var e=this,n=[],t=0,r;t<arguments.length;t++)n[t]=arguments[t];return this._getClient().then((function(e){r=e})).then((function(t){return e._worker.withSyncedResources(n)})).then((function(e){return r}))},e}(),o,a,u,s,c,d,f,l,g,h,p,m,v,b,_,y,w,k,x;!function(e){function n(e,n){return{line:e,character:n}}function t(e){var n=e;return ee.objectLiteral(n)&&ee.number(n.line)&&ee.number(n.character)}e.create=n,e.is=t}(o||(o={})),function(e){function n(e,n,t,r){if(ee.number(e)&&ee.number(n)&&ee.number(t)&&ee.number(r))return{start:o.create(e,n),end:o.create(t,r)};if(o.is(e)&&o.is(n))return{start:e,end:n};throw new Error("Range#create called with invalid arguments["+e+", "+n+", "+t+", "+r+"]")}function t(e){var n=e;return ee.objectLiteral(n)&&o.is(n.start)&&o.is(n.end)}e.create=n,e.is=t}(a||(a={})),function(e){function n(e,n){return{uri:e,range:n}}function t(e){var n=e;return ee.defined(n)&&a.is(n.range)&&(ee.string(n.uri)||ee.undefined(n.uri))}e.create=n,e.is=t}(u||(u={})),function(e){function n(e,n,t,r){return{targetUri:e,targetRange:n,targetSelectionRange:t,originSelectionRange:r}}function t(e){var n=e;return ee.defined(n)&&a.is(n.targetRange)&&ee.string(n.targetUri)&&(a.is(n.targetSelectionRange)||ee.undefined(n.targetSelectionRange))&&(a.is(n.originSelectionRange)||ee.undefined(n.originSelectionRange))}e.create=n,e.is=t}(s||(s={})),function(e){function n(e,n,t,r){return{red:e,green:n,blue:t,alpha:r}}function t(e){var n=e;return ee.number(n.red)&&ee.number(n.green)&&ee.number(n.blue)&&ee.number(n.alpha)}e.create=n,e.is=t}(c||(c={})),function(e){function n(e,n){return{range:e,color:n}}function t(e){var n=e;return a.is(n.range)&&c.is(n.color)}e.create=n,e.is=t}(d||(d={})),function(e){function n(e,n,t){return{label:e,textEdit:n,additionalTextEdits:t}}function t(e){var n=e;return ee.string(n.label)&&(ee.undefined(n.textEdit)||b.is(n))&&(ee.undefined(n.additionalTextEdits)||ee.typedArray(n.additionalTextEdits,b.is))}e.create=n,e.is=t}(f||(f={})),function(e){e.Comment="comment",e.Imports="imports",e.Region="region"}(l||(l={})),function(e){function n(e,n,t,r,i){var o={startLine:e,endLine:n};return ee.defined(t)&&(o.startCharacter=t),ee.defined(r)&&(o.endCharacter=r),ee.defined(i)&&(o.kind=i),o}function t(e){var n=e;return ee.number(n.startLine)&&ee.number(n.startLine)&&(ee.undefined(n.startCharacter)||ee.number(n.startCharacter))&&(ee.undefined(n.endCharacter)||ee.number(n.endCharacter))&&(ee.undefined(n.kind)||ee.string(n.kind))}e.create=n,e.is=t}(g||(g={})),function(e){function n(e,n){return{location:e,message:n}}function t(e){var n=e;return ee.defined(n)&&u.is(n.location)&&ee.string(n.message)}e.create=n,e.is=t}(h||(h={})),function(e){e.Error=1,e.Warning=2,e.Information=3,e.Hint=4}(p||(p={})),function(e){function n(e,n,t,r,i,o){var a={range:e,message:n};return ee.defined(t)&&(a.severity=t),ee.defined(r)&&(a.code=r),ee.defined(i)&&(a.source=i),ee.defined(o)&&(a.relatedInformation=o),a}function t(e){var n=e;return ee.defined(n)&&a.is(n.range)&&ee.string(n.message)&&(ee.number(n.severity)||ee.undefined(n.severity))&&(ee.number(n.code)||ee.string(n.code)||ee.undefined(n.code))&&(ee.string(n.source)||ee.undefined(n.source))&&(ee.undefined(n.relatedInformation)||ee.typedArray(n.relatedInformation,h.is))}e.create=n,e.is=t}(m||(m={})),function(e){function n(e,n){for(var t=[],r=2;r<arguments.length;r++)t[r-2]=arguments[r];var i={title:e,command:n};return ee.defined(t)&&t.length>0&&(i.arguments=t),i}function t(e){var n=e;return ee.defined(n)&&ee.string(n.title)&&ee.string(n.command)}e.create=n,e.is=t}(v||(v={})),function(e){function n(e,n){return{range:e,newText:n}}function t(e,n){return{range:{start:e,end:e},newText:n}}function r(e){return{range:e,newText:""}}function i(e){var n=e;return ee.objectLiteral(n)&&ee.string(n.newText)&&a.is(n.range)}e.replace=n,e.insert=t,e.del=r,e.is=i}(b||(b={})),function(e){function n(e,n){return{textDocument:e,edits:n}}function t(e){var n=e;return ee.defined(n)&&S.is(n.textDocument)&&Array.isArray(n.edits)}e.create=n,e.is=t}(_||(_={})),function(e){function n(e,n){var t={kind:"create",uri:e};return void 0===n||void 0===n.overwrite&&void 0===n.ignoreIfExists||(t.options=n),t}function t(e){var n=e;return n&&"create"===n.kind&&ee.string(n.uri)&&(void 0===n.options||(void 0===n.options.overwrite||ee.boolean(n.options.overwrite))&&(void 0===n.options.ignoreIfExists||ee.boolean(n.options.ignoreIfExists)))}e.create=n,e.is=t}(y||(y={})),function(e){function n(e,n,t){var r={kind:"rename",oldUri:e,newUri:n};return void 0===t||void 0===t.overwrite&&void 0===t.ignoreIfExists||(r.options=t),r}function t(e){var n=e;return n&&"rename"===n.kind&&ee.string(n.oldUri)&&ee.string(n.newUri)&&(void 0===n.options||(void 0===n.options.overwrite||ee.boolean(n.options.overwrite))&&(void 0===n.options.ignoreIfExists||ee.boolean(n.options.ignoreIfExists)))}e.create=n,e.is=t}(w||(w={})),function(e){function n(e,n){var t={kind:"delete",uri:e};return void 0===n||void 0===n.recursive&&void 0===n.ignoreIfNotExists||(t.options=n),t}function t(e){var n=e;return n&&"delete"===n.kind&&ee.string(n.uri)&&(void 0===n.options||(void 0===n.options.recursive||ee.boolean(n.options.recursive))&&(void 0===n.options.ignoreIfNotExists||ee.boolean(n.options.ignoreIfNotExists)))}e.create=n,e.is=t}(k||(k={})),function(e){function n(e){var n=e;return n&&(void 0!==n.changes||void 0!==n.documentChanges)&&(void 0===n.documentChanges||n.documentChanges.every((function(e){return ee.string(e.kind)?y.is(e)||w.is(e)||k.is(e):_.is(e)})))}e.is=n}(x||(x={}));var C=function(){function e(e){this.edits=e}return e.prototype.insert=function(e,n){this.edits.push(b.insert(e,n))},e.prototype.replace=function(e,n){this.edits.push(b.replace(e,n))},e.prototype.delete=function(e){this.edits.push(b.del(e))},e.prototype.add=function(e){this.edits.push(e)},e.prototype.all=function(){return this.edits},e.prototype.clear=function(){this.edits.splice(0,this.edits.length)},e}(),E=function(){function e(e){var n=this;this._textEditChanges=Object.create(null),e&&(this._workspaceEdit=e,e.documentChanges?e.documentChanges.forEach((function(e){if(_.is(e)){var t=new C(e.edits);n._textEditChanges[e.textDocument.uri]=t}})):e.changes&&Object.keys(e.changes).forEach((function(t){var r=new C(e.changes[t]);n._textEditChanges[t]=r})))}return Object.defineProperty(e.prototype,"edit",{get:function(){return this._workspaceEdit},enumerable:!0,configurable:!0}),e.prototype.getTextEditChange=function(e){if(S.is(e)){if(this._workspaceEdit||(this._workspaceEdit={documentChanges:[]}),!this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var n=e,t;if(!(t=this._textEditChanges[n.uri])){var r,i={textDocument:n,edits:r=[]};this._workspaceEdit.documentChanges.push(i),t=new C(r),this._textEditChanges[n.uri]=t}return t}if(this._workspaceEdit||(this._workspaceEdit={changes:Object.create(null)}),!this._workspaceEdit.changes)throw new Error("Workspace edit is not configured for normal text edit changes.");var t;if(!(t=this._textEditChanges[e])){var r=[];this._workspaceEdit.changes[e]=r,t=new C(r),this._textEditChanges[e]=t}return t},e.prototype.createFile=function(e,n){this.checkDocumentChanges(),this._workspaceEdit.documentChanges.push(y.create(e,n))},e.prototype.renameFile=function(e,n,t){this.checkDocumentChanges(),this._workspaceEdit.documentChanges.push(w.create(e,n,t))},e.prototype.deleteFile=function(e,n){this.checkDocumentChanges(),this._workspaceEdit.documentChanges.push(k.create(e,n))},e.prototype.checkDocumentChanges=function(){if(!this._workspaceEdit||!this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.")},e}(),I,S,T,R,M,P,D,F,A,O,L,j,N,W,U,H,K;!function(e){function n(e){return{uri:e}}function t(e){var n=e;return ee.defined(n)&&ee.string(n.uri)}e.create=n,e.is=t}(I||(I={})),function(e){function n(e,n){return{uri:e,version:n}}function t(e){var n=e;return ee.defined(n)&&ee.string(n.uri)&&(null===n.version||ee.number(n.version))}e.create=n,e.is=t}(S||(S={})),function(e){function n(e,n,t,r){return{uri:e,languageId:n,version:t,text:r}}function t(e){var n=e;return ee.defined(n)&&ee.string(n.uri)&&ee.string(n.languageId)&&ee.number(n.version)&&ee.string(n.text)}e.create=n,e.is=t}(T||(T={})),function(e){e.PlainText="plaintext",e.Markdown="markdown"}(R||(R={})),function(e){function n(n){var t=n;return t===e.PlainText||t===e.Markdown}e.is=n}(R||(R={})),function(e){function n(e){var n=e;return ee.objectLiteral(e)&&R.is(n.kind)&&ee.string(n.value)}e.is=n}(M||(M={})),function(e){e.Text=1,e.Method=2,e.Function=3,e.Constructor=4,e.Field=5,e.Variable=6,e.Class=7,e.Interface=8,e.Module=9,e.Property=10,e.Unit=11,e.Value=12,e.Enum=13,e.Keyword=14,e.Snippet=15,e.Color=16,e.File=17,e.Reference=18,e.Folder=19,e.EnumMember=20,e.Constant=21,e.Struct=22,e.Event=23,e.Operator=24,e.TypeParameter=25}(P||(P={})),function(e){e.PlainText=1,e.Snippet=2}(D||(D={})),function(e){function n(e){return{label:e}}e.create=n}(F||(F={})),function(e){function n(e,n){return{items:e||[],isIncomplete:!!n}}e.create=n}(A||(A={})),function(e){function n(e){return e.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}function t(e){var n=e;return ee.string(n)||ee.objectLiteral(n)&&ee.string(n.language)&&ee.string(n.value)}e.fromPlainText=n,e.is=t}(O||(O={})),function(e){function n(e){var n=e;return!!n&&ee.objectLiteral(n)&&(M.is(n.contents)||O.is(n.contents)||ee.typedArray(n.contents,O.is))&&(void 0===e.range||a.is(e.range))}e.is=n}(L||(L={})),function(e){function n(e,n){return n?{label:e,documentation:n}:{label:e}}e.create=n}(j||(j={})),function(e){function n(e,n){for(var t=[],r=2;r<arguments.length;r++)t[r-2]=arguments[r];var i={label:e};return ee.defined(n)&&(i.documentation=n),ee.defined(t)?i.parameters=t:i.parameters=[],i}e.create=n}(N||(N={})),function(e){e.Text=1,e.Read=2,e.Write=3}(W||(W={})),function(e){function n(e,n){var t={range:e};return ee.number(n)&&(t.kind=n),t}e.create=n}(U||(U={})),function(e){e.File=1,e.Module=2,e.Namespace=3,e.Package=4,e.Class=5,e.Method=6,e.Property=7,e.Field=8,e.Constructor=9,e.Enum=10,e.Interface=11,e.Function=12,e.Variable=13,e.Constant=14,e.String=15,e.Number=16,e.Boolean=17,e.Array=18,e.Object=19,e.Key=20,e.Null=21,e.EnumMember=22,e.Struct=23,e.Event=24,e.Operator=25,e.TypeParameter=26}(H||(H={})),function(e){function n(e,n,t,r,i){var o={name:e,kind:n,location:{uri:r,range:t}};return i&&(o.containerName=i),o}e.create=n}(K||(K={}));var V=function(){function e(){}return e}(),z,B,J,$,q;!function(e){function n(e,n,t,r,i,o){var a={name:e,detail:n,kind:t,range:r,selectionRange:i};return void 0!==o&&(a.children=o),a}function t(e){var n=e;return n&&ee.string(n.name)&&ee.number(n.kind)&&a.is(n.range)&&a.is(n.selectionRange)&&(void 0===n.detail||ee.string(n.detail))&&(void 0===n.deprecated||ee.boolean(n.deprecated))&&(void 0===n.children||Array.isArray(n.children))}e.create=n,e.is=t}(V||(V={})),function(e){e.QuickFix="quickfix",e.Refactor="refactor",e.RefactorExtract="refactor.extract",e.RefactorInline="refactor.inline",e.RefactorRewrite="refactor.rewrite",e.Source="source",e.SourceOrganizeImports="source.organizeImports"}(z||(z={})),function(e){function n(e,n){var t={diagnostics:e};return null!=n&&(t.only=n),t}function t(e){var n=e;return ee.defined(n)&&ee.typedArray(n.diagnostics,m.is)&&(void 0===n.only||ee.typedArray(n.only,ee.string))}e.create=n,e.is=t}(B||(B={})),function(e){function n(e,n,t){var r={title:e};return v.is(n)?r.command=n:r.edit=n,void 0!==t&&(r.kind=t),r}function t(e){var n=e;return n&&ee.string(n.title)&&(void 0===n.diagnostics||ee.typedArray(n.diagnostics,m.is))&&(void 0===n.kind||ee.string(n.kind))&&(void 0!==n.edit||void 0!==n.command)&&(void 0===n.command||v.is(n.command))&&(void 0===n.edit||x.is(n.edit))}e.create=n,e.is=t}(J||(J={})),function(e){function n(e,n){var t={range:e};return ee.defined(n)&&(t.data=n),t}function t(e){var n=e;return ee.defined(n)&&a.is(n.range)&&(ee.undefined(n.command)||v.is(n.command))}e.create=n,e.is=t}($||($={})),function(e){function n(e,n){return{tabSize:e,insertSpaces:n}}function t(e){var n=e;return ee.defined(n)&&ee.number(n.tabSize)&&ee.boolean(n.insertSpaces)}e.create=n,e.is=t}(q||(q={}));var Q=function(){function e(){}return e}();!function(e){function n(e,n,t){return{range:e,target:n,data:t}}function t(e){var n=e;return ee.defined(n)&&a.is(n.range)&&(ee.undefined(n.target)||ee.string(n.target))}e.create=n,e.is=t}(Q||(Q={}));var G=["\n","\r\n","\r"],X,Y;!function(e){function n(e,n,t,r){return new Z(e,n,t,r)}function t(e){var n=e;return!!(ee.defined(n)&&ee.string(n.uri)&&(ee.undefined(n.languageId)||ee.string(n.languageId))&&ee.number(n.lineCount)&&ee.func(n.getText)&&ee.func(n.positionAt)&&ee.func(n.offsetAt))}function r(e,n){for(var t=e.getText(),r=i(n,(function(e,n){var t=e.range.start.line-n.range.start.line;return 0===t?e.range.start.character-n.range.start.character:t})),o=t.length,a=r.length-1;a>=0;a--){var u=r[a],s=e.offsetAt(u.range.start),c=e.offsetAt(u.range.end);if(!(c<=o))throw new Error("Overlapping edit");t=t.substring(0,s)+u.newText+t.substring(c,t.length),o=s}return t}function i(e,n){if(e.length<=1)return e;var t=e.length/2|0,r=e.slice(0,t),o=e.slice(t);i(r,n),i(o,n);for(var a=0,u=0,s=0;a<r.length&&u<o.length;){var c=n(r[a],o[u]);e[s++]=c<=0?r[a++]:o[u++]}for(;a<r.length;)e[s++]=r[a++];for(;u<o.length;)e[s++]=o[u++];return e}e.create=n,e.is=t,e.applyEdits=r}(X||(X={})),function(e){e.Manual=1,e.AfterDelay=2,e.FocusOut=3}(Y||(Y={}));var Z=function(){function e(e,n,t,r){this._uri=e,this._languageId=n,this._version=t,this._content=r,this._lineOffsets=null}return Object.defineProperty(e.prototype,"uri",{get:function(){return this._uri},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"languageId",{get:function(){return this._languageId},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"version",{get:function(){return this._version},enumerable:!0,configurable:!0}),e.prototype.getText=function(e){if(e){var n=this.offsetAt(e.start),t=this.offsetAt(e.end);return this._content.substring(n,t)}return this._content},e.prototype.update=function(e,n){this._content=e.text,this._version=n,this._lineOffsets=null},e.prototype.getLineOffsets=function(){if(null===this._lineOffsets){for(var e=[],n=this._content,t=!0,r=0;r<n.length;r++){t&&(e.push(r),t=!1);var i=n.charAt(r);t="\r"===i||"\n"===i,"\r"===i&&r+1<n.length&&"\n"===n.charAt(r+1)&&r++}t&&n.length>0&&e.push(n.length),this._lineOffsets=e}return this._lineOffsets},e.prototype.positionAt=function(e){e=Math.max(Math.min(e,this._content.length),0);var n=this.getLineOffsets(),t=0,r=n.length;if(0===r)return o.create(0,e);for(;t<r;){var i=Math.floor((t+r)/2);n[i]>e?r=i:t=i+1}var a=t-1;return o.create(a,e-n[a])},e.prototype.offsetAt=function(e){var n=this.getLineOffsets();if(e.line>=n.length)return this._content.length;if(e.line<0)return 0;var t=n[e.line],r=e.line+1<n.length?n[e.line+1]:this._content.length;return Math.max(Math.min(t+e.character,r),t)},Object.defineProperty(e.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!0,configurable:!0}),e}(),ee;!function(e){var n=Object.prototype.toString;function t(e){return void 0!==e}function r(e){return void 0===e}function i(e){return!0===e||!1===e}function o(e){return"[object String]"===n.call(e)}function a(e){return"[object Number]"===n.call(e)}function u(e){return"[object Function]"===n.call(e)}function s(e){return null!==e&&"object"==typeof e}function c(e,n){return Array.isArray(e)&&e.every(n)}e.defined=t,e.undefined=r,e.boolean=i,e.string=o,e.number=a,e.func=u,e.objectLiteral=s,e.typedArray=c}(ee||(ee={}));var ne=monaco.Uri,te=monaco.Range,re=function(){function e(e,n,t){var r=this;this._languageId=e,this._worker=n,this._disposables=[],this._listener=Object.create(null);var i=function(e){var n=e.getModeId(),t;n===r._languageId&&(r._listener[e.uri.toString()]=e.onDidChangeContent((function(){clearTimeout(t),t=setTimeout((function(){return r._doValidate(e.uri,n)}),500)})),r._doValidate(e.uri,n))},o=function(e){monaco.editor.setModelMarkers(e,r._languageId,[]);var n=e.uri.toString(),t=r._listener[n];t&&(t.dispose(),delete r._listener[n])};this._disposables.push(monaco.editor.onDidCreateModel(i)),this._disposables.push(monaco.editor.onWillDisposeModel(o)),this._disposables.push(monaco.editor.onDidChangeModelLanguage((function(e){o(e.model),i(e.model)}))),t.onDidChange((function(e){monaco.editor.getModels().forEach((function(e){e.getModeId()===r._languageId&&(o(e),i(e))}))})),this._disposables.push({dispose:function(){for(var e in r._listener)r._listener[e].dispose()}}),monaco.editor.getModels().forEach(i)}return e.prototype.dispose=function(){this._disposables.forEach((function(e){return e&&e.dispose()})),this._disposables=[]},e.prototype._doValidate=function(e,n){this._worker(e).then((function(n){return n.doValidation(e.toString())})).then((function(t){var r=t.map((function(n){return oe(e,n)})),i=monaco.editor.getModel(e);i.getModeId()===n&&monaco.editor.setModelMarkers(i,n,r)})).then(void 0,(function(e){console.error(e)}))},e}();function ie(e){switch(e){case p.Error:return monaco.MarkerSeverity.Error;case p.Warning:return monaco.MarkerSeverity.Warning;case p.Information:return monaco.MarkerSeverity.Info;case p.Hint:return monaco.MarkerSeverity.Hint;default:return monaco.MarkerSeverity.Info}}function oe(e,n){var t="number"==typeof n.code?String(n.code):n.code;return{severity:ie(n.severity),startLineNumber:n.range.start.line+1,startColumn:n.range.start.character+1,endLineNumber:n.range.end.line+1,endColumn:n.range.end.character+1,message:n.message,code:t,source:n.source}}function ae(e){if(e)return{character:e.column-1,line:e.lineNumber-1}}function ue(e){if(e)return{start:{line:e.startLineNumber-1,character:e.startColumn-1},end:{line:e.endLineNumber-1,character:e.endColumn-1}}}function se(e){if(e)return new monaco.Range(e.start.line+1,e.start.character+1,e.end.line+1,e.end.character+1)}function ce(e){var n=monaco.languages.CompletionItemKind;switch(e){case P.Text:return n.Text;case P.Method:return n.Method;case P.Function:return n.Function;case P.Constructor:return n.Constructor;case P.Field:return n.Field;case P.Variable:return n.Variable;case P.Class:return n.Class;case P.Interface:return n.Interface;case P.Module:return n.Module;case P.Property:return n.Property;case P.Unit:return n.Unit;case P.Value:return n.Value;case P.Enum:return n.Enum;case P.Keyword:return n.Keyword;case P.Snippet:return n.Snippet;case P.Color:return n.Color;case P.File:return n.File;case P.Reference:return n.Reference}return n.Property}function de(e){if(e)return{range:se(e.range),text:e.newText}}var fe=function(){function e(e){this._worker=e}return Object.defineProperty(e.prototype,"triggerCharacters",{get:function(){return[" ",":"]},enumerable:!0,configurable:!0}),e.prototype.provideCompletionItems=function(e,n,t,r){var i=e.uri;return this._worker(i).then((function(e){return e.doComplete(i.toString(),ae(n))})).then((function(t){if(t){var r=e.getWordUntilPosition(n),i=new te(n.lineNumber,r.startColumn,n.lineNumber,r.endColumn),o=t.items.map((function(e){var n={label:e.label,insertText:e.insertText||e.label,sortText:e.sortText,filterText:e.filterText,documentation:e.documentation,detail:e.detail,range:i,kind:ce(e.kind)};return e.textEdit&&(n.range=se(e.textEdit.range),n.insertText=e.textEdit.newText),e.additionalTextEdits&&(n.additionalTextEdits=e.additionalTextEdits.map(de)),e.insertTextFormat===D.Snippet&&(n.insertTextRules=monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet),n}));return{isIncomplete:t.isIncomplete,suggestions:o}}}))},e}();function le(e){return e&&"object"==typeof e&&"string"==typeof e.kind}function ge(e){return"string"==typeof e?{value:e}:le(e)?"plaintext"===e.kind?{value:e.value.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}:{value:e.value}:{value:"```"+e.language+"\n"+e.value+"\n```\n"}}function he(e){if(e)return Array.isArray(e)?e.map(ge):[ge(e)]}var pe=function(){function e(e){this._worker=e}return e.prototype.provideHover=function(e,n,t){var r=e.uri;return this._worker(r).then((function(e){return e.doHover(r.toString(),ae(n))})).then((function(e){if(e)return{range:se(e.range),contents:he(e.contents)}}))},e}();function me(e){switch(e){case W.Read:return monaco.languages.DocumentHighlightKind.Read;case W.Write:return monaco.languages.DocumentHighlightKind.Write;case W.Text:return monaco.languages.DocumentHighlightKind.Text}return monaco.languages.DocumentHighlightKind.Text}var ve=function(){function e(e){this._worker=e}return e.prototype.provideDocumentHighlights=function(e,n,t){var r=e.uri;return this._worker(r).then((function(e){return e.findDocumentHighlights(r.toString(),ae(n))})).then((function(e){if(e)return e.map((function(e){return{range:se(e.range),kind:me(e.kind)}}))}))},e}();function be(e){return{uri:ne.parse(e.uri),range:se(e.range)}}var _e=function(){function e(e){this._worker=e}return e.prototype.provideDefinition=function(e,n,t){var r=e.uri;return this._worker(r).then((function(e){return e.findDefinition(r.toString(),ae(n))})).then((function(e){if(e)return[be(e)]}))},e}(),ye=function(){function e(e){this._worker=e}return e.prototype.provideReferences=function(e,n,t,r){var i=e.uri;return this._worker(i).then((function(e){return e.findReferences(i.toString(),ae(n))})).then((function(e){if(e)return e.map(be)}))},e}();function we(e){if(e&&e.changes){var n=[];for(var t in e.changes){for(var r=[],i=0,o=e.changes[t];i<o.length;i++){var a=o[i];r.push({range:se(a.range),text:a.newText})}n.push({resource:ne.parse(t),edits:r})}return{edits:n}}}var ke=function(){function e(e){this._worker=e}return e.prototype.provideRenameEdits=function(e,n,t,r){var i=e.uri;return this._worker(i).then((function(e){return e.doRename(i.toString(),ae(n),t)})).then((function(e){return we(e)}))},e}();function xe(e){var n=monaco.languages.SymbolKind;switch(e){case H.File:return n.Array;case H.Module:return n.Module;case H.Namespace:return n.Namespace;case H.Package:return n.Package;case H.Class:return n.Class;case H.Method:return n.Method;case H.Property:return n.Property;case H.Field:return n.Field;case H.Constructor:return n.Constructor;case H.Enum:return n.Enum;case H.Interface:return n.Interface;case H.Function:return n.Function;case H.Variable:return n.Variable;case H.Constant:return n.Constant;case H.String:return n.String;case H.Number:return n.Number;case H.Boolean:return n.Boolean;case H.Array:return n.Array}return n.Function}var Ce=function(){function e(e){this._worker=e}return e.prototype.provideDocumentSymbols=function(e,n){var t=e.uri;return this._worker(t).then((function(e){return e.findDocumentSymbols(t.toString())})).then((function(e){if(e)return e.map((function(e){return{name:e.name,detail:"",containerName:e.containerName,kind:xe(e.kind),range:se(e.location.range),selectionRange:se(e.location.range)}}))}))},e}(),Ee=function(){function e(e){this._worker=e}return e.prototype.provideDocumentColors=function(e,n){var t=e.uri;return this._worker(t).then((function(e){return e.findDocumentColors(t.toString())})).then((function(e){if(e)return e.map((function(e){return{color:e.color,range:se(e.range)}}))}))},e.prototype.provideColorPresentations=function(e,n,t){var r=e.uri;return this._worker(r).then((function(e){return e.getColorPresentations(r.toString(),n.color,ue(n.range))})).then((function(e){if(e)return e.map((function(e){var n={label:e.label};return e.textEdit&&(n.textEdit=de(e.textEdit)),e.additionalTextEdits&&(n.additionalTextEdits=e.additionalTextEdits.map(de)),n}))}))},e}(),Ie=function(){function e(e){this._worker=e}return e.prototype.provideFoldingRanges=function(e,n,t){var r=e.uri;return this._worker(r).then((function(e){return e.provideFoldingRanges(r.toString(),n)})).then((function(e){if(e)return e.map((function(e){var n={start:e.startLine+1,end:e.endLine+1};return void 0!==e.kind&&(n.kind=Se(e.kind)),n}))}))},e}();function Se(e){switch(e){case l.Comment:return monaco.languages.FoldingRangeKind.Comment;case l.Imports:return monaco.languages.FoldingRangeKind.Imports;case l.Region:return monaco.languages.FoldingRangeKind.Region}}function Te(e){var n=new i(e),t=function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];return n.getLanguageServiceWorker.apply(n,[e].concat(t))},r=e.languageId;monaco.languages.registerCompletionItemProvider(r,new fe(t)),monaco.languages.registerHoverProvider(r,new pe(t)),monaco.languages.registerDocumentHighlightProvider(r,new ve(t)),monaco.languages.registerDefinitionProvider(r,new _e(t)),monaco.languages.registerReferenceProvider(r,new ye(t)),monaco.languages.registerDocumentSymbolProvider(r,new Ce(t)),monaco.languages.registerRenameProvider(r,new ke(t)),monaco.languages.registerColorProvider(r,new Ee(t)),monaco.languages.registerFoldingRangeProvider(r,new Ie(t)),new re(r,t,e)}}}]);