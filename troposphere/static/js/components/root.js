define(['react', 'components/header', 'components/sidebar',
'components/footer', 'components/notifications', 'router',
'controllers/profile', 'components/settings', 'components/projects/list',
'components/applications/list', 'components/applications/favorites',
'components/applications/detail', 'controllers/providers',
'components/providers', 'components/help',
'components/instance_detail', 'components/volume_detail',
'components/applications/search_results'], 
function (React, Header, Sidebar, Footer, Notifications, Router,
Profile, Settings, Projects, ApplicationList, ApplicationFavorites,
ApplicationDetail, ProviderController, Providers, Help, InstanceDetail,
VolumeDetail, ApplicationSearchResults) {

    var Root = React.createClass({
        getInitialState: function() {
            return {
                loggedIn: this.props.session.isValid(),
                profile: null,
                route: null,
                routeArgs: [],
                providers: null,
                identities: null
            };
        },
        handleRoute: function(page, args) {
            this.setState({route: page, routeArgs: args});
            if (page === 'appDetail') {
                Profile.getIdentities().then(function(identities) {
                    this.setState({'identities': identities});
                }.bind(this));
            }
        },
        beginRouting: function() {
            this.router = new Router({
                loggedIn: this.state.loggedIn,
                application: this
            });

            this.router.on("route", this.handleRoute);

            Backbone.history.start({
                pushState: true,
                root: url_root
            });
        },
        fetchProfile: function() {
            Profile.getProfile().then(function(profile) {
                this.setState({profile: profile});

                profile.on('change', function(m) {
                    this.setState({profile: m});
                }.bind(this));
            }.bind(this));
        },
        fetchProviders: function() {
            // TODO: fetch providers only on demand in stead of at mount
            ProviderController.getProviders().then(function(providers) {
                this.setState({providers: providers});

                providers.on('change', function(m) {
                    this.setState({providers: providers});
                }.bind(this));
            }.bind(this));
        },
        componentDidMount: function() {
            this.beginRouting();
            if (this.props.session.isValid()) {
                this.fetchProfile();
                this.fetchProviders();
            }
        },
        handleNavigate: function(route, options) {
            this.router.navigate(route, options);
        },
        pages: {
            projects: function() {
                return Projects();
            },
            images: function() {
                return ApplicationList();
            },
            appFavorites: function() {
                return ApplicationFavorites();
            },
            appDetail: function(appId) {
                return ApplicationDetail({
                    applicationId: appId,
                    profile: this.state.profile,
                    identities: this.state.identities,
                    providers: this.state.providers
                });
            },
            appSearch: function(query) {
                return ApplicationSearchResults({
                    query: query,
                });
            },
            instanceDetail: function(providerId, identityId, instanceId) {
                return InstanceDetail({
                    providerId: providerId,
                    identityId: identityId,
                    instanceId: instanceId,
                    providers: this.state.providers
                });
            },
            volumeDetail: function(providerId, identityId, volumeId) {
                return VolumeDetail({
                    providerId: providerId,
                    identityId: identityId,
                    volumeId: volumeId,
                    providers: this.state.providers
                });
            },
            providers: function() {
                // TODO: Get providers lazily
                return Providers({providers: this.state.providers});
            },
            settings: function() {
                return Settings({profile: this.state.profile});
            },
            help: function() {
                return Help();
            }
        },
        renderContent: function() {
            if (this.state.route)
                return this.pages[this.state.route].apply(this, this.state.routeArgs);
            return React.DOM.div();
        },
        render: function() {
            return React.DOM.div({},
                Header({profile: this.state.profile}),
                Sidebar({loggedIn: this.state.loggedIn, 
                    currentRoute: this.state.route,
                    onNavigate: this.handleNavigate}),
                Notifications(),
                React.DOM.div({id: 'main'}, this.renderContent()),
                Footer());
        }
    });

    return Root;
});
