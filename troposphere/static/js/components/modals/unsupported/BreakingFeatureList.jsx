import React from "react";
import modernizrTest from "components/modals/unsupported/modernizrTest";

export default React.createClass({
    displayName: "BreakingFeatureList",
    render: function() {
        var listItem = modernizrTest.breakingFeatures.map(function(feature) {
            return (
                <li className="feature" key={feature.id}>
                    <span className="glyphicon glyphicon-alert" />
                    {feature}
                </li>
            );
        });

        return <ul className="BreakingFeatureList">{listItem}</ul>;
    }
});
