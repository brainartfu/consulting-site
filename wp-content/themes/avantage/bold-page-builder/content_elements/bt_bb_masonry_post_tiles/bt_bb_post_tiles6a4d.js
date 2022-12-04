(function( $ ) {

	var bt_bb_post_tiles_load_images = function( root ) {
		root.each(function() {
			var page_bottom = $( window ).scrollTop() + $( window ).height();
			$( this ).find( '.bt_bb_grid_item' ).each(function() {
				var this_top = $( this ).offset().top;
				if ( this_top < page_bottom + $( window ).height() ) {
					var img_src = $( this ).data( 'src' );
					if ( img_src !== '' && $( this ).find( '.bt_bb_grid_item_post_thumbnail a' ).html() == '' ) {
						$( this ).find( '.bt_bb_grid_item_post_thumbnail a' ).html( '<img src="' + img_src + '">' );
					}
				}
			});
		});
	}

	var bt_bb_post_tiles_load_items = function( root ) {
		root.each(function() {
			var loading = root.data( 'loading' );
			if ( loading === undefined || ( loading != 'loading' && loading != 'no_more' ) ) {
				var page_bottom = $( window ).scrollTop() + $( window ).height();
				$( this ).find( '.bt_bb_grid_item' ).each(function() {
					var this_top = $( this ).offset().top;
					if ( this_top < page_bottom + $( window ).height() ) {
						if ( $( this ).is( ':last-child' ) ) {
							var root_data_offset = root.data( 'offset' );
							var offset = parseInt( root_data_offset === undefined ? 0 : root_data_offset ) + parseInt( root.data( 'number-posts' ) );
							bt_bb_masonry_post_tiles_load_posts( root, offset );
							return false;
						}
					}
				});
			}
		});
	}
	
	var bt_bb_masonry_post_tiles_load_posts = function( root, offset ) {

		if ( offset == 0 ) {
			root.addClass( 'bt_bb_grid_hide' );
			root.find( '.bt_bb_grid_item' ).remove();
			if ( root.hasClass( 'masonry' ) ) {
				root.masonry( 'destroy' );
			}
		}
		
		root.parent().find( '.bt_bb_post_grid_loader' ).show();
		if ( root.data( 'post-type' ) == 'portfolio' ) {
			var action = 'bt_bb_get_masonry_post_tiles';
		} else {
			var action = 'bt_bb_get_masonry_post_tiles';
		}
		
		var data = {
			'action': action,
			'number': root.data( 'number-posts' ),
			'format': root.data( 'format-posts' ),
			'category': root.data( 'category-posts' ),
			'show': root.data( 'show-posts' ),
			'offset': offset,
                        'bt-nonce': root.data( 'bt-nonce' )
		};

		root.data( 'loading', 'loading' );
			
		$.ajax({
			type: 'POST',
			url: ajax_object.ajax_url,
			data: data,
			async: true,
			success: function( response ) {

				if ( response == '' ) {
					root.data( 'loading', 'no_more' );
					root.parent().find( '.bt_bb_post_grid_loader' ).hide();
					return;
				}

				var $content = $( response );
				root.append( $content );
				bt_bb_resize();

				root.data( 'offset', offset );

				if ( offset > 0 ) {
					root.masonry( 'appended', $content );
				} else {
					root.masonry({
						columnWidth: '.bt_bb_grid_sizer',
						itemSelector: '.bt_bb_grid_item',
						gutter: 0,
						percentPosition: true
					});
				}
				root.parent().find( '.bt_bb_post_grid_loader' ).hide();
				root.removeClass( 'bt_bb_grid_hide' );
				$( '.bt_bb_grid_container' ).css( 'height', 'auto' );

				bt_bb_post_tiles_load_images( root );

				if ( root.data( 'auto-loading' ) == 'auto_loading' ) {
					root.data( 'loading', '' );
				} else {
					root.data( 'loading', 'no_more' );
				}

			},
                        error: function( response ) {
				root.data( 'loading', 'no_more' );
				root.parent().find( '.bt_bb_post_grid_loader' ).hide();	
				root.removeClass( 'bt_bb_grid_hide' );			
			}
		});
	}

	$( document ).ready(function() {

		$( window ).on( 'scroll', function() {
			bt_bb_post_tiles_load_images( $( '.bt_bb_masonry_post_tiles_content' ) );
			bt_bb_post_tiles_load_items( $( '.bt_bb_masonry_post_tiles_content' ) );
		});

		$( '.bt_bb_masonry_post_tiles_content' ).each(function() {
			var grid_content = $( this );
			bt_bb_masonry_post_tiles_load_posts( grid_content, 0 );
		});

		$( '.bt_bb_masonry_post_tiles_filter_item' ).on( 'click', function() {
                        var root = $( this ).closest( '.bt_bb_grid_container' );
			root.height( root.height() );
			$( this ).parent().find( '.bt_bb_masonry_post_tiles_filter_item' ).removeClass( 'active' ); 
			$( this ).addClass( 'active' );			
			var grid_content = $( this ).closest( '.bt_bb_masonry_post_tiles' ).find( '.bt_bb_masonry_post_tiles_content' );
			grid_content.data( 'category-posts', $( this ).data( 'category-posts' ) );
			grid_content.data( 'format-posts', $( this ).data( 'format-posts' ) );
			grid_content.data( 'post-type', $( this ).data( 'post-type' ) );
                        
			bt_bb_masonry_post_tiles_load_posts( grid_content, 0 );
		});
		
	});


	$( window ).ready(function() {
		window.bt_bb_resize = function() {
			$( '.bt_bb_masonry_post_tiles_content .bt_bb_grid_item .bt_bb_grid_item_inner' ).each( function() {
				$( this ).css( 'height', '' );
				var h = Math.ceil( $( this ).width() * $( this ).data( 'hw' ) );
				$( this ).css( 'height', h );
			});
			$( '.bt_bb_masonry_post_tiles_content .bt_bb_grid_item .bt_bb_grid_item_inner  .bt_bb_grid_item_inner_image' ).each( function() {
				$( this ).css( 'height', '' );
				var h = Math.ceil( $( this ).width() * $( this ).data( 'hw' ) );
				$( this ).css( 'height', h );
			});	
			$( '.bt_bb_masonry_post_tiles_content' ).each( function() {
				$( this ).width( 'initial' );
				var child_left_margin = parseInt( $( this ).find( '.bt_bb_masonry_post_image_content' ).css( 'margin-left' ) );
				var base_item_width =  ( $( this ).width() - child_left_margin ) / ( $( this ).data( 'columns' ) ) ;
				if ( Math.ceil( base_item_width ) != base_item_width ) {
					$( this ).width( $( this ).data( 'columns' ) * Math.ceil( base_item_width ) + child_left_margin );
				} 				
			});

		}		
	});


	$( window ).load(function() {

		bt_bb_resize();
		
		$( '.bt_bb_masonry_post_image_content' ).masonry({
			columnWidth: '.bt_bb_grid_sizer',
			itemSelector: '.bt_bb_grid_item',
			gutter: 0,
			percentPosition: true
		});

		$( window ).on( 'resize', function() {
			bt_bb_resize();
		});
		
		setTimeout(function() {
			$( '.bt_bb_masonry_post_image_content' ).masonry( 'layout' );
		}, 10 );
		
	});

})( jQuery );