var React = require('react');
var TransitionEvents = require('react/lib/ReactTransitionEvents');

/* This mixin keeps track of its own 'internal' expanded state.  This is to
 * help enable running css animations on the collapsable component.  The
 * expanded state /cannot/ be set /before/ the mixin has had a chance to
 * ensure that dimensions have been set on the collapsable component.  This
 * is due to how browsers interact with css transitions.  If the mixin does 
 * not share an 'expanded' state then it makes it a lot easier to handle the
 * order in which the dimension and `expanded` information is set.
*/
var CollapsableMixin = {

  propTypes: {
    defaultExpanded: React.PropTypes.bool,
    expanded: React.PropTypes.bool
  },

  getInitialState: function(){
    var defaultExpanded = this.props.defaultExpanded != null
      ? this.props.defaultExpanded
      : this.props.expanded != null
        ? this.props.expanded
        : false;

    return {
      __collapsableMixinExpanded__: defaultExpanded,
      expanded: defaultExpanded,
      collapsing: false
    }
  },

  componentDidUpdate: function(prevProps, prevState){
    this._setDimensionValues(prevProps, prevState);
    this._checkToggle(prevProps, prevState);
  },

  _setDimensionValues: function(prevProps, prevState){
    var wasExpanded = prevState.__collapsableMixinExpanded__;
    var node = this.getCollapsableDOMNode();
    var dimension = this.dimension();
    var value = this.getCollapsableDimensionValue();

    // setting the dimension here starts the transition animation
    if(!wasExpanded && this.state.collapsing) {
      node.style[dimension] = value + 'px';
    } else if(wasExpanded && this.state.collapsing) {
      node.style[dimension] = '0px';
    }
  },

  _checkToggle: function(prevProps, prevState){
    var wasExpanded = prevProps.expanded != null ? prevProps.expanded : prevState.expanded;
    var isExpanded = this.isExpanded();
    if(wasExpanded != isExpanded){
      this._internalToggle();
    }
  },

  _internalToggle: function(){
    this.state.__collapsableMixinExpanded__
      ? this._handleCollapse()
      : this._handleExpand();
  },

  _handleExpand: function(){
    var node = this.getCollapsableDOMNode();
    var dimension = this.dimension();

    // ensure node has dimension value, needed for animation
    node.style[dimension] = '0px';

    var complete = (function (){
      this._removeEndEventListener(node, complete);
      // remove dimension value - this ensures the collapsable item can grow
      // in dimension after initial display (such as an image loading)
      node.style[dimension] = '';
      this.setState({
        collapsing:false
      });
    }).bind(this);

    this._addEndEventListener(node, complete);

    this.setState({
      __collapsableMixinExpanded__: true,
      collapsing: true
    });
  },

  _handleCollapse: function(){
    var node = this.getCollapsableDOMNode();
    var dimension = this.dimension();
    var value = this.getCollapsableDimensionValue();

    // ensure node has dimension value, needed for animation
    node.style[dimension] = value + 'px';

    var complete = (function (){
      this._removeEndEventListener(node, complete);
      this.setState({
        collapsing: false
      });
    }).bind(this);

    this._addEndEventListener(node, complete);

    this.setState({
      __collapsableMixinExpanded__: false,
      collapsing: true
    });
  },

  // helps enable test stubs
  _addEndEventListener: function(node, complete){
    TransitionEvents.addEndEventListener(node, complete);
  },

  // helps enable test stubs
  _removeEndEventListener: function(node, complete){
    TransitionEvents.removeEndEventListener(node, complete);
  },

  dimension: function(){
    return (typeof this.getCollapsableDimension === 'function')
      ? this.getCollapsableDimension()
      : 'height';
  },

  isExpanded: function(){
    return this.props.expanded != null ? this.props.expanded : this.state.expanded;
  },

  getCollapsableClassSet: function (className) {
    var classes = {};

    if (typeof className === 'string') {
      className.split(' ').forEach(function (className) {
        if (className) {
          classes[className] = true;
        }
      });
    }

    classes.collapsing = this.state.collapsing;
    classes.collapse = !this.state.collapsing;
    classes['in'] = this.state.__collapsableMixinExpanded__ && !this.state.collapsing;

    return classes;
  }
};

module.exports = CollapsableMixin;
