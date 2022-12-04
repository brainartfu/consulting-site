( function( $ ) { 
	"use strict";
	
	function boldTimelineFixLineHeight() {
		
		// Fix line height for vertical timeline
		
		// console.log( 'boldTimelineFixLineHeight' );
		
		jQuery( '.bold_timeline_container.bold_timeline_container_has_line_style.bold_timeline_container_line_position_vertical' ).each( function( index ) {
			
			var $lastItem = jQuery( this ).find( '.bold_timeline_item' ).last();
			var $firstGroup = jQuery( this ).find( '.bold_timeline_group' ).first();
			var $line = jQuery( this ).find( '.bold_timeline_container_line' ).first();
			
			// console.log( $lastItem );
			
			if ( $lastItem.length > 0 ) {
				var th = $lastItem.outerHeight();
				
				// console.log( th );
				
				var tl = $line.outerHeight();
				console.log( $lastItem );
				var $itemMarker = $lastItem.find( '.bold_timeline_item_marker' ).last();
				console.log( $itemMarker );
				var mt = $itemMarker.length > 0 ? $itemMarker.position().top : 32;
				var mh = $itemMarker.length > 0 ? $itemMarker.outerHeight() : 16;
				
				var b = th - mt - mh / 2;
				jQuery( this ).find( '.bold_timeline_container_line' ).css( 'bottom', b + 'px' );				
			}
			var t = $firstGroup.find('.bold_timeline_group_header').outerHeight();
			jQuery( this ).find( '.bold_timeline_container_line' ).css( 'top', t + 'px' );
		} );
		
	}

	function boldTimelineMoveOverlapingItems() {
		
		// Move overlaping items
		
		jQuery( '.bold_timeline_container.bold_timeline_container_line_position_center.bold_timeline_container_line_position_overlap .bold_timeline_group_content' ).each( function( index ) {
		
			jQuery( this ).find( '.bold_timeline_item:not(:first-child)' ).each( function( index ) {
					
				var mt 				= 0;
				var default_gap 	= 64;	// Default gap
				var connector_top 	= 32;	// Default connector top position, TODO: izracunati ovo tako da bude standardan razmak
				
				var $this 			= jQuery( this );
				var $prev 			= jQuery( this ).prev( '.bold_timeline_item' );
				var $prev_prev 		= $prev.prev( '.bold_timeline_item' );
				
				var this_h 			= $this.outerHeight();				
				var this_t 			= $this.position().top;
				
				var prev_h 			= $prev.length > 0 ? $prev.outerHeight() : 0;
				var prev_mt 		= $prev.length > 0 ? $prev.data( 'margin-top' ) : 0;
				var prev_t 			= $prev.length > 0 ? $prev.position().top : 0;
				
				var prev_b 			= prev_t + prev_h + prev_mt;
				
				var prev_prev_h 	= $prev_prev.length > 0 ? $prev_prev.outerHeight() : 0;
				var prev_prev_mt 	= $prev_prev.length > 0 ? $prev_prev.data( 'margin-top' ) : 0;
				var prev_prev_t 	= $prev_prev.length > 0 ? $prev_prev.position().top : 0;
				
				var prev_prev_b 	= prev_prev_t + prev_prev_h + prev_prev_mt;

				
				if ( index == 0 ) {
					/* second item in a group */
					mt = -( prev_h - default_gap);						
				} else if ( prev_prev_b > prev_t + prev_mt )  {
					/* align to prev prev */
					mt = prev_prev_b - this_t + default_gap;	
					if ( prev_prev_b > prev_b) {
						mt = prev_b - prev_prev_b;
					}		
				} else if ( prev_t + prev_mt > prev_prev_b ) {
					/* align to prev top  */
					mt = prev_t - this_t + prev_mt + default_gap + connector_top;
				} else {
					/* align to prev bottom */
					mt = prev_b - this_t + default_gap + connector_top;					
				}
				
				/*
				console.log( 'prev_h: ' + prev_h );
				console.log( 'prev_mt: ' + prev_mt );
				console.log( 'index: ' + index );
				console.log( 'mt: ' + mt );
				*/


				jQuery( this ).css( 'margin-top', '' + mt + 'px' );
				jQuery( this ).data( 'margin-top', mt );	
			
			} );
			
		} );
		
		boldTimelineAnimateItems();
		
	}

	function boldTimelineInitHorizontalTimeline() {
		
		// Init sliders (vertical timelines)
		jQuery('.bold_timeline_container.bold_timeline_container_line_position_horizontal .bold_timeline_container_content').each( function( index ) {
			jQuery( this ).find( '.bold_timeline_group_show_button' ).remove();
			jQuery( this ).find( '.bold_timeline_group' ).each( function( index ) {
				if ( jQuery( this ).find( '.bold_timeline_item' ).length > 0 ) {
					jQuery( this ).find( '.bold_timeline_item' ).unwrap().insertAfter( jQuery( this ) );
					// Move group into next item
					jQuery( this ).addClass( 'bold_timeline_group_prepended' ).prependTo( jQuery( this ).next() );					
				} else {
					// Empty group
					jQuery( this ).remove();
				}
			});
			jQuery( this ).slick();
		} );
	}	
	
	function boldTimelineInitShowHideItem() {
		// items
		jQuery('.bold_timeline_container_item_content_display_hide .bold_timeline_item_override_content_display_inherit.bold_timeline_item, .bold_timeline_container .bold_timeline_item_override_content_display_hide.bold_timeline_item').on( 'click', function() {
			jQuery( this ).toggleClass('on');
			boldTimelineFixLineHeight();
			boldTimelineAnimateItems();
			return false;
		});
		// groups 
		jQuery('.bold_timeline_group_show_button .bold_timeline_item_button').on( 'click', function() {
			jQuery( this ).parents('.bold_timeline_group').toggleClass('on');
			boldTimelineFixLineHeight();
			boldTimelineAnimateItems();
			return false;
		});
	}
	
	function boldTimelineAnimateItems() {
		var $all_elems = jQuery( '.bold_timeline_animate:not(.bold_timeline_animated)' );
		var $visible_elems = [];
		if ( $all_elems.length > 0 ) {
			$all_elems.each(function() {
				if ( boldTimelineIsItemOnScreen( jQuery(this) ) ) {
					$visible_elems.push( jQuery(this) );
				}
			});
		}
		if ( $visible_elems.length > 0 ) {
			jQuery.each( $visible_elems, function( index ) {
				jQuery(this).css( 'transition-delay', index * 100 + 'ms');
				jQuery(this).addClass( 'bold_timeline_animated' );
			});
		}
		// boldTimelineFixLineHeight();
	}

	function boldTimelineIsItemOnScreen( elem, top_offset ) {
		top_offset = ( top_offset === undefined ) ? 75 : top_offset;
		var element = elem.get( 0 );
		if ( element == undefined ) return false;
		var bounds = element.getBoundingClientRect();
		return bounds.top + top_offset < window.innerHeight && bounds.bottom > 0;
	}


	// general init
	
	var bold_timeline_init_finished;
	window.bold_timeline_init_finished = false;
	
	document.addEventListener('readystatechange', function() { 
		// if ( ! window.bold_timeline_init_finished && ( document.readyState === 'interactive' || document.readyState === 'complete' ) ) {
		if ( ! window.bold_timeline_init_finished && ( document.readyState === 'complete' ) ) {
			boldTimelineFixLineHeight();		
			boldTimelineInitHorizontalTimeline();			
			boldTimelineMoveOverlapingItems();			
			boldTimelineInitShowHideItem();	
			// boldTimelineAnimateItems();	/* call from moveoverlaping items */	
			window.bold_timeline_init_finished = true;		
		}
		jQuery( document ).on( 'scroll', function() { 
			boldTimelineAnimateItems(); 
		});
		
	}, false);
	
	// end init
	
} )( jQuery );