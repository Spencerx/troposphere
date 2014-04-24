/* base.js
 * Backbone.js base model functionality.
 */
define(['backbone'], function(Backbone) {

    var Base = Backbone.Model.extend({
        defaults: {
            'model_name': 'base'
        },
        urlRoot: '/api/v1',
        url: function() {
            var creds = this.getCreds();
            var url = this.urlRoot
                + '/provider/' + creds.provider_id
                + '/identity/' + creds.identity_id
                + '/' + this.defaults.model_name + '/';
            
            if (this.get('id') !== undefined) {
                url += this.get('id') + '/';
            }

            return url;
        },
        /*
         * Here, were override the get method to allow lazy-loading of computed
         * attributes
         */
        get: function(attr) {
            if (typeof this[attr] == 'function')
                return this[attr]();
            return Backbone.Model.prototype.get.call(this, attr);
        },
    });

    return Base;

});
