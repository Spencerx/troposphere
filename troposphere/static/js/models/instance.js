define(['underscore', 'models/base', 'utils'], function(_, Base, Utils) {

var statics = {
    /*
     * The API returns a field called "ip_address", which might be public or
     * private. It's awful and should be changed in the future. This is a hack.
     * Please refer to RFC 1918 for how to classify private addresses.
     */
    addressIsPrivate: function(address) {
        var ranges = [['10.0.0.0', 8], ['172.16.0.0', 12], ['192.168.0.0', 16]];

        var addrToInt = function(addr) {
            var strToInt = function(str) {return parseInt(str, 10);};
            var parts = _.map(addr.split('.'), strToInt);
            return _.foldl(parts, function(memo, num) {
                return (memo << 8) | num;
            }, 0);
        };

        var intToMask = function(i) {return ~((1 << (32 - i)) - 1);};

        return _.any(ranges, function(range) {
            var addr = addrToInt(range[0]);
            var mask = intToMask(range[1]);
            return (addrToInt(address) & mask) == addr;
        });
    }
};

var Instance = Base.extend({
    
    defaults: { 'model_name': 'instance' },
    parse: function(attributes) {
        attributes.id = attributes.alias;
        attributes.start_date = new Date(attributes.start_date);
        var ip = attributes.ip_address;
        delete attributes.ip_address;
        if (Instance.addressIsPrivate(ip))
            attributes.private_ip_address = ip;
        else if (ip != '0.0.0.0')
            attributes.public_ip_address = ip;
        return attributes;
    },
    getCreds: function() {
        return {
            provider_id: this.get('identity').provider,
            identity_id: this.get('identity').id
        };
    },
    name_or_id: function() {
        return this.get('name') || this.get('id');
    },
    shell_url: function() {
        if (this.get('public_ip_address'))
            return "/shell/" + this.get('public_ip_address');
        return null;
    },
    vnc_url: function() {
        if (this.get('public_ip_address'))
            return "http://" + this.get('public_ip_address') + ":5904";
        return null;
    },
    is_active: function() {
        var states = ['active', 'running', 'verify_resize'];
        return _.contains(states, this.get('status'));
    },
    is_build: function() {
        var states = [
            'build',
            'build - block_device_mapping',
            'build - scheduling',
            'build - spawning',
            'build - networking' ,
            'active - powering-off',
            'active - image_uploading',
            'shutoff - powering-on',
            'pending',
            'suspended - resuming',
            'active - suspending',
            'resize - resize_prep',
            'resize - resize_migrating',
            'resize - resize_migrated',
            'resize - resize_finish',
            'active - networking',
            'active - deploying',
            'active - initializing',
            'hard_reboot - rebooting_hard',
            'revert_resize - resize_reverting'
        ];
        return _.contains(states, this.get('status'));
    },
    is_delete: function() {
        var states = ['delete', 'active - deleting', 'deleted', 'shutting-down', 
            'terminated'];
        return _.contains(states, this.get('status'));
    },
    is_inactive: function() {
        var states = ['suspended', 'shutoff'];
        return _.contains(states, this.get('status'));
    },
    is_resize: function() {
        return this.get('status').indexOf('resize') > -1;
    },
    select: function() {
        this.collection.select_instance(this);
    },
    destroy: function(options) {
        // We overwrite the destroy function so that the model doesn't get deleted while the instance is still 'terminating'

        options = options ? _.clone(options) : {};
        var model = this;
        var success = options.success;

        var self = this;
        options.success = function(resp) {
            if (success) {
                success(model, resp, options);

                // Get the new state from the data returned by API call
                self.set('state', resp.status);
            }

            if (!model.isNew())
                model.trigger('sync', model, resp, options);
        };

        // wrapError function from backbone.js
        var wrapError = function (model, options) {
            var error = options.error;
            options.error = function(resp) {
                if (error) error(model, resp, options);
                model.trigger('error', model, resp, options);
            };
        };

        if (this.isNew()) {
            options.success();
            return false;
        }

        wrapError(this, options);

        var xhr = this.sync('delete', this, options);
        return xhr;
    }
}, statics);

_.extend(Instance.defaults, Base.defaults);

return Instance;

});
