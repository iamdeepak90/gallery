; (function ($) {
	'use strict';


	$(document).ready(function () {

		var players = []; // Array to store player instances
		var wcgs_swiper_thumb,
			wcgs_swiper_gallery;
		// jQuery extension to check if images are loaded.
		$.fn.wpgspimagesLoaded = function () {
			var $imgs = this.find('img[src!=""]');
			if (!$imgs.length) {
				return $.Deferred().resolve().promise();
			}
			var dfds = [];
			$imgs.each(function () {
				var dfd = $.Deferred();
				dfds.push(dfd);
				var img = new Image();
				img.onload = function () { dfd.resolve(); };
				img.onerror = function () { dfd.resolve(); };
				img.src = this.src;
			});
			return $.when.apply($, dfds);
		};

		// Set all settings.
		var settings = wcgs_object.wcgs_settings;
		var $is_modern_layout = false;
		if (settings.gallery_layout == 'modern') {
			settings.gallery_layout = 'grid';
			$is_modern_layout = true;
		}
		var $is_anchor_navigation = false;
		if (settings.gallery_layout == 'anchor_navigation') {
			settings.gallery_layout = 'grid';
			$is_anchor_navigation = true;
		}


		//magnifying code start
		const zoomArea = document.querySelector(".zoomarea");
		const sliderImages = document.querySelectorAll(".xzoom");

		sliderImages.forEach((img) => {
			img.addEventListener("mouseenter", function () {
				const fullImageSrc = img.getAttribute("xoriginal");
				zoomArea.style.display = "block";
				zoomArea.style.backgroundImage = `url(${encodeURI(fullImageSrc)})`;

				const rect = img.getBoundingClientRect();
				const bgWidth = rect.width * settings.zoomlevel;
				const bgHeight = rect.height * settings.zoomlevel;

				zoomArea.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;

				img.addEventListener("mousemove", function (e) {
					const rect = img.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const y = e.clientY - rect.top;

					const bgPosX = -((x / rect.width) * bgWidth - zoomArea.clientWidth / 2);
					const bgPosY = -((y / rect.height) * bgHeight - zoomArea.clientHeight / 2);

					zoomArea.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
				});
			});

			img.addEventListener("mouseleave", function () {
				zoomArea.style.display = "none";
				zoomArea.style.backgroundImage = "";
			});
		});
		//magnifying code end



		var $gallery_item = typeof settings.gallery_item !== 'undefined' ? settings.gallery_item : 'all';
		var $single_combination = typeof settings.single_combination !== 'undefined' ? settings.single_combination : 'single';
		var $grid_column = 2;
		if ( typeof settings.columns !== 'undefined') {
			$grid_column = typeof settings.columns.desktop !== 'undefined' ? settings.columns.desktop : 2;
			if ($(window).width() < 520 && typeof settings.columns.mobile !== 'undefined') {
				$grid_column = settings.columns.mobile;
			} else if ($(window).width() < 736 && typeof settings.columns.tablet !== 'undefined') {
				$grid_column = settings.columns.tablet;
			} else if ($(window).width() < 992 && typeof settings.columns.laptop !== 'undefined') {
				$grid_column = settings.columns.laptop;
			}
		}
		var wcgs_product_wrapper = wcgs_object.wcgs_product_wrapper;
		var wcgs_body_font_size = parseInt(wcgs_object.wcgs_body_font_size);
		var is_rtl = $('body').hasClass('rtl') ? true : false;
		var gallery_w = 0;
		var summary_w = 0;
		var gallery_layout_on_mobile = typeof settings.gallery_layout_on_mobile != 'undefined' ? settings.gallery_layout_on_mobile : false;
		var thumb_active_on = typeof settings.thumb_active_on != 'undefined' ? settings.thumb_active_on : 'click';
		var infinite_loop = (settings.infinite_loop == '1') ? true : false;
		var video_only_popup = true;
		var wgsp_lightbox = (settings.lightbox == '1') ? true : false;
		if (typeof settings.video_popup_place != 'undefined' && settings.video_popup_place == 'inline') {
			video_only_popup = false;
		}
		// Adjust admin bar.
		if ($('#wpadminbar').length) {
			$('.fancybox-container').css('top', '40px');
		}
		var wcgs_swiper = settings.gallery_layout == 'grid' ? false : true;
		function SwiperSlide(selector, options) {
			if (typeof WCGSSwiper !== 'undefined') {
				return new WCGSSwiper(selector, options);
			} else if (typeof Swiper !== 'undefined') {
				return new Swiper(selector, options);
			} else {
				// console.log("Swiper is undefined");
				wcgs_swiper = false;
			}
		}

		// Change the layout from vertical to horizontal on mobile devices.
		if (gallery_layout_on_mobile == '1' && (settings.gallery_layout == 'vertical' || settings.gallery_layout == 'vertical_right')) {
			if ($(window).width() < 620) {
				settings.gallery_layout = 'horizontal';
				$('.wcgs-carousel').removeClass('vertical').addClass('horizontal');
				$('.gallery-navigation-carousel').removeClass('vertical').addClass('horizontal');
				$('#wpgs-gallery').removeClass('vertical').addClass('horizontal');
			}
		}
		var first_slide_moved = false;
		function move_first_slide() {
			if (first_slide_moved) {
				return;
			}
			$('.wcgs-grid-template').children().first().prependTo('.wcgs-grid-template-container');
			first_slide_moved = true;
		}
		if ($is_modern_layout) {
			move_first_slide();
		}
		// Youtube API script function.
		function wcgs_add_youtube_api_script() {
			var youtubeScriptId = 'youtube-api';
			var youtubeScript = document.getElementById(youtubeScriptId);
			if (youtubeScript === null) {
				var tag = document.createElement('script');
				var firstScript = document.getElementsByTagName('script')[0];
				tag.src = 'https://www.youtube.com/iframe_api';
				tag.id = youtubeScriptId;
				firstScript.parentNode.insertBefore(tag, firstScript);
			}
		}
		// Initialize YouTube videos.
		function initializeYouTubeVideos() {
			$('.wcgs-carousel .wcgs-slider-image .wcgs-youtube-video').each(function (index) {
				var videoId = $(this).data('video-id');
				$(this).attr('data-unique-id', index)
				var $unique_id = $(this).attr('data-unique-id');
				var playbackTimes = {};
				var wcgs_player = new YT.Player(this, {
					videoId: videoId,
					playerVars: {
						controls: settings.yt_video_controls !== undefined && settings.yt_video_controls ? settings.yt_video_controls : 0,
						modestbranding: 1,
						showinfo: 0,
						rel: settings.yt_related_video !== undefined && settings.yt_related_video ? settings.yt_related_video : 0,
						fs: 1,
						start: playbackTimes[videoId] || 0
					},
					events: {
						'onStateChange': function (event) {
							if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
								playbackTimes[videoId] = event.target.getCurrentTime();
							}
							if (settings.video_looping !== undefined && 1 == settings.video_looping && event.data === YT.PlayerState.ENDED) {
								wcgs_player.loadVideoById({ videoId });
							}
						}
					}
				});
				window[videoId + $unique_id] = wcgs_player;
			});
		}
		function autoPlayYtVideo() {
			$('.wcgs-carousel .wcgs-slider-image').each(function (index) {
				var videos = $(this);
				// Check if auto playing videos on slide transition is enabled.
				if (settings.autoplay_video_on_sliding == 1) {
					// Handle videos in iframe.
					if (videos.find('.wcgs-iframe').length > 0) {
						// Check and set data-src attribute if missing.
						if (!videos.find('.wcgs-iframe').attr('data-src')) {
							videos.find('.wcgs-iframe').attr('data-src', videos.find('.wcgs-iframe').attr('src'));
						}
						// Get the source of the iframe.
						var iframe_src = videos.find('.wcgs-iframe').attr('data-src');
						// Repeat the video using a function and obtain the repeat_video variable.
						var repeat_video = repeat_video_loop(iframe_src);
						// Handle YouTube videos and set volume and play.
						if (videos && videos.find('.wcgs-youtube-video').length > 0) {
							var $unique_id = videos.find('.wcgs-youtube-video').attr('data-unique-id');
							if ($.isFunction(window[repeat_video + $unique_id].playVideo)) {
								window[repeat_video + $unique_id].playVideo();
								window[repeat_video + $unique_id].mute();
							}

						} else {
							// Handle non-YouTube videos in the iframe.
							if (videos.find('.facebook-iframe').length < 1) {
								repeat_video = settings.video_looping == 1 ? "&playlist=" + repeat_video : '';
								videos.find('.wcgs-iframe')[0].src = iframe_src + "?autoplay=1&mute=1&loop=1&muted=1" + repeat_video;
							}
						}
					} else if (videos.find('video').length > 0) {
						// Handle videos directly embedded in video elements.
						if (settings.video_looping == 1) {
							videos.find('video').attr('loop', true);
						}
						videos.find('video')[0].muted = "muted";
						// Play the video
						videos.find('video')[0].play();
					}

					// Handle video controls and autoplay settings.
					if (settings.autoplay_video_on_sliding == 1 && typeof settings.video_controls != 'undefined' && settings.video_controls != 1) {
						if (videos.find('video').length > 0) {
							videos.parents('.wcgs-carousel').addClass('video-controls-none'); // Add class to disable click event.
						} else {
							videos.parents('.wcgs-carousel').removeClass('video-controls-none');
						}
					}

				}
			});
		}
		// To play yt video inline.
		if (!video_only_popup) {
			wcgs_add_youtube_api_script(); // Load YT script,
			// Use setInterval to repeatedly check for YT object.
			var checkYTInterval = setInterval(function () {
				if (typeof YT === 'object' && typeof YT.Player === 'function') {
					clearInterval(checkYTInterval); // Clear the interval once YT object is available.
					initializeYouTubeVideos();
					setTimeout(() => {
						autoPlayYtVideo();
					}, 1000);
				}
			}, 300); // Check every 300 milliseconds.
		}

		// Function to check and hide/show navigation arrows.
		function checkArrowsVisibility(nav_swiper) {
			setTimeout(function () {
				var allowSlidePrev = typeof nav_swiper.allowSlidePrev != 'undefined' ? nav_swiper.allowSlidePrev : false;
				var allowSlideNext = typeof nav_swiper.allowSlideNext != 'undefined' ? nav_swiper.allowSlideNext : false;
				if (allowSlidePrev || allowSlideNext) {
					$(".gallery-navigation-carousel-wrapper .wcgs-swiper-arrow").show();
				} else {
					$(".gallery-navigation-carousel-wrapper .wcgs-swiper-arrow").hide();
				}
			}, 300);
		}
		function wcgs_set_gallery_width(width) {
			// Set default width unit as '%'.
			var width_unit = '%';
			// Check the gallery layout and width conditions to determine the width unit.
			if (settings.gallery_layout == 'vertical' || settings.gallery_layout == 'vertical_right' || settings.gallery_layout == 'hide_thumb' || width > 100) {
				width_unit = 'px';
			}
			// Check window width for responsive behavior.
			if ($(window).width() < 992 && settings.gallery_responsive_width.width > 0) {
				width_unit = settings.gallery_responsive_width.unit;
			}
			// Check window width for mobile responsiveness.
			if ($(window).width() < 768) {
				width_unit = settings.gallery_responsive_width.unit;
			}
			// Store the gallery width in a variable.
			var wpgs_gallery_width = width;

			setTimeout(function () {
				// Initialize the summary width variable.
				var summary_w;
				// Calculate summary width for '%' unit.
				if ('%' === width_unit) {
					summary_w = (100 - wpgs_gallery_width);
					summary_w = summary_w > 20 ? 'calc( ' + summary_w + '% - 50px )' : '';
				}

				// Calculate summary width for 'px' or 'em' unit.
				if ('%' !== width_unit) {
					var parent_wrapper = $('#wpgs-gallery').parent('*');
					var parent_wrapper_width = parent_wrapper.width() > ($('#wpgs-gallery').width() + 100) ? parent_wrapper.width() : 0;
					summary_w = parent_wrapper_width > 200 ? (parent_wrapper_width - wpgs_gallery_width) : 0;
					summary_w = summary_w > 150 ? (summary_w - 50) + width_unit : '';

					// Calculate summary width for 'em' unit.
					if ('em' === width_unit) {
						parent_wrapper_width = parent_wrapper_width / wcgs_body_font_size;
						summary_w = parent_wrapper_width > wpgs_gallery_width ? (parent_wrapper_width - wpgs_gallery_width) : 0;
						summary_w = summary_w > 10 ? (summary_w - 3) + width_unit : '';
					}
				}
				// Set the max width of the summary element.
				$('#wpgs-gallery ~ .summary').css('maxWidth', summary_w);
			}, 100);

			// Set the minimum and maximum width of the #wpgs-gallery element.
			$("#wpgs-gallery")
				.css('minWidth', 'auto')
				.css('maxWidth', width + width_unit);

			// Check if the body does not have the class 'theme-Avada'
			if (!$('body').hasClass('theme-Avada')) {
				// Get the width of the #wpgs-gallery element
				width = $("#wpgs-gallery").width();
			}
			// return width;
		}
		function initialize_self_hosted_video() {
			// Initialize self host video.
			var selfHostedVideos = $(document).find('.wcgs-carousel video.video-js');
			var wcgs_vol = typeof settings.video_volume != 'undefined' ? settings.video_volume : 0.5;
			if (selfHostedVideos.length > 0 && selfHostedVideos) {
				selfHostedVideos.each(function (index, element) {
					if (typeof videojs !== 'undefined') {
						videojs(element);
					}
				})
			}
		}
		// Custom lazy load scripts for the logo image.
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					var img = entry.target;
					if (img.dataset.src) {
						img.src = img.dataset.src;
						// Remove the data-src attribute
						img.removeAttribute('data-src');
					}
					// if (img.dataset.srcset) {
					// 	img.srcset = img.dataset.srcset;
					// 	// Remove the data-srcset attribute
					// 	img.removeAttribute('data-srcset');
					// }
					img.classList.remove('wcgs-lazyload');
					img.classList.add("wcgs-lazyloaded");
					observer.unobserve(img);
					setTimeout(function () {
						img.style.removeProperty('height');
					}, 300);
				}
			});
		});

		// Lazy-load scripts for the all logo images.
		function custom_lazyLoad() {
			var lazyImages = document.querySelectorAll(".wcgs-lazyload");
			lazyImages.forEach(function (img) {
				var image_height = (img.getAttribute('height') / img.getAttribute('width')) * img.offsetWidth;
				if (image_height > 10) {
					img.style.height = image_height + 'px';
				}
				observer.observe(img);
			});
		}
		function wcgs_grid_init(width) {
			wcgs_set_gallery_width(width)
			if (wgsp_lightbox) {
				$(document).on('click', '.wcgs-carousel .wcgs-lightbox, .wcgs-slider-image .wcgs-video-icon, .wcgs-slider-image .wcgs-slider-image-tag', function (e) {
					$(this).parents('.wcgs-slider-image').find('.wcgs-grid-lightbox a').trigger('click');
				});
			}
			initialize_self_hosted_video();
			// custom_lazyLoad();
			setTimeout(() => {
				$('#wpgs-gallery').removeClass('wcgs-swiper-before-init');
			}, 400);
		}

		// Function to initialize gallery for gallery.
		function wcgs_slider_func(width) {
			wcgs_set_gallery_width(width);
			// Calculate the width of the vertical thumbnails
			var vertical_thumbs_width = typeof settings.vertical_thumbs_width != 'undefined' ? parseInt(settings.vertical_thumbs_width) : 20;
			var vertical_thumb_width = (width / 100) * vertical_thumbs_width;
			// Set default gallery layout as 'horizontal'.
			var gallery_layout = (settings.gallery_layout == 'vertical' || settings.gallery_layout == 'vertical_right') ? 'vertical' : 'horizontal';
			// Get the count of wcgs-thumb elements.
			var wcgs_img_count = $("#wpgs-gallery")
				.find('.gallery-navigation-carousel .wcgs-thumb')
				.length;
			// Set the slide_orientation based on the settings
			var slide_orientation = settings.slide_orientation;
			// Set the adaptive_height, accessibility, autoplay, pagination, navigation, slider_dir, infinite_loop, autoplay_interval, speed, and navigation_visibility based on the settings
			var adaptive_height = (settings.adaptive_height == '1') ? true : false;
			var accessibility = (settings.accessibility == '1') ? true : false;
			var autoplay = (settings.autoplay == '1') ? true : false;
			var pagination = (settings.pagination == '1') ? true : false;
			var navigation = (settings.navigation == '1') ? true : false;
			var autoplay_interval = parseInt(settings.autoplay_interval);
			var thumbnails_sliders_space = typeof settings.thumbnails_sliders_space.width != 'undefined' ? settings.thumbnails_sliders_space.width : 6;
			var pagination_type = typeof settings.pagination_type != 'undefined' ? settings.pagination_type : 'bullets';
			var thumbnail_style = typeof settings.thumbnail_style != 'undefined' ? settings.thumbnail_style : 'border_around';
			// Free mode Default true.
			var free_mode = true;
			if (typeof settings.free_mode != 'undefined') {
				free_mode = settings.free_mode == '1' ? true : false;
			}
			var mouse_wheel = false;
			if (typeof settings.mouse_wheel != 'undefined') {
				mouse_wheel = settings.mouse_wheel == '1' ? true : false;
			}
			var speed = settings.autoplay_speed;
			// Set the wcgs_vol to settings.video_volume if it is defined, otherwise set it to 0.5.
			var wcgs_vol = typeof settings.video_volume != 'undefined' ? settings.video_volume : 0.5;
			var dynamicBullets = false;
			if (pagination_type == 'bullets' || pagination_type == 'strokes' || pagination_type == 'numbers') {
				pagination_type = 'bullets';
			} else if (pagination_type == 'progressbar') {
				pagination_type = 'progressbar';
			} else if (pagination_type == 'dynamic') {
				pagination_type = 'bullets';
				dynamicBullets = true;

			}

			// Trigger current item after clicking on lightbox icon.
			if (wgsp_lightbox) {
				$(document).on('click', '.wcgs-carousel .wcgs-lightbox, .wcgs-slider-image .wcgs-video-icon, .wcgs_xzoom-source, .wcgs_xzoom-lens, .wcgs-slider-image .wcgs-slider-image-tag ', function (e) {
					$(document).find('.wcgs-carousel .swiper-slide-active a').trigger('click');

					if ($('.wcgs-carousel .swiper-slide-active').find('.wcgs-youtube-video').length > 0) {
						// Get the video ID from data attribute.
						var video_id = $('.wcgs-carousel .swiper-slide-active').find('.wcgs-youtube-video').data('video-id');
						var $unique_id = $('.wcgs-carousel .swiper-slide-active').find('.wcgs-youtube-video').attr('data-unique-id');
						if ($.isFunction(window[video_id + $unique_id].pauseVideo)) {
							// Pause the YouTube video.
							window[video_id + $unique_id].pauseVideo();
						}
					} else {
						stopVideos($('.wcgs-carousel .swiper-slide-active'));
					}
				});
			}
			if (wcgs_swiper) {
				// Hide the gallery navigation carousel if there is only one image or the gallery layout is set to 'hide_thumb'.
				if (wcgs_img_count == 1 || settings.gallery_layout == 'hide_thumb') {
					$("#wpgs-gallery").find('.gallery-navigation-carousel').hide();
					$('.wcgs-carousel').css('width', '100%');
				} else {
					$("#wpgs-gallery").find('.gallery-navigation-carousel').show();
				}
				if (wcgs_img_count == 1) {
					$("#wpgs-gallery .wcgs-swiper-arrow").hide()
				}
				if (settings.gallery_layout == 'horizontal' || settings.gallery_layout == 'horizontal_top') {
					if (slide_orientation == 'vertical') {
						var maxHeight = 0;
						$('#wpgs-gallery .wcgs-carousel').each(function () {
							if ($(this).innerHeight() > maxHeight) {
								maxHeight = $(this).innerHeight();
							}
						});
						$('.wcgs-carousel .swiper-slide').css('minHeight', maxHeight);
						$('#wpgs-gallery .wcgs-carousel .swiper-slide').css({
							"display": "flex",
							"justify-content": "center",
							"align-items": "center",
						});
					}
				} else if (settings.gallery_layout == 'hide_thumb') {
					$('.wcgs-carousel').css('width', width);
				} else {
					if (wcgs_img_count > 1) {
						var vertical_gap = typeof settings.thumbnails_sliders_space.height != 'undefined' ? parseInt(settings.thumbnails_sliders_space.height) : 6;
						$('.wcgs-carousel.swiper').css('maxWidth', width - vertical_thumb_width - vertical_gap);
						$('.wcgs-carousel.swiper').css('width', width - vertical_thumb_width - vertical_gap);
						var maxHeight = 0;
						$('#wpgs-gallery .wcgs-carousel img').each(function () {
							if ($(this).innerHeight() > maxHeight) {
								maxHeight = $(this).innerHeight();
							}
						});
						$('.gallery-navigation-carousel-wrapper').css('maxHeight', maxHeight).css('width', vertical_thumb_width);
						$('.wcgs-carousel .swiper-slide').css('minHeight', maxHeight);
					}
				}
				$('#wpgs-gallery').wpgspimagesLoaded().then(function () {
					if (settings.gallery_layout == 'horizontal' || settings.gallery_layout == 'horizontal_top') {

					} else if (settings.gallery_layout == 'hide_thumb') {
						$('.wcgs-carousel').css('width', width);
					} else {
						if (wcgs_img_count > 1) {
							$('.wcgs-carousel').css('width', (width - vertical_thumb_width - settings.thumbnails_space));
							setTimeout(function () {
								var maxHeight = 0,
									selector = '.wcgs-carousel .wcgs-slider-image img';
								$(selector).each(function (i) {
									if ($(this).innerHeight() > maxHeight) {
										maxHeight = $(this).innerHeight();
									}
								})
								if (slide_orientation == 'vertical') {
									$('#wpgs-gallery .wcgs-carousel .swiper-slide').css({ 'maxHeight': maxHeight })
								}
								$('.gallery-navigation-carousel-wrapper').css('maxHeight', maxHeight).css('width', vertical_thumb_width);
								if ('Hard-crop' != settings.image_crop_size.unit) {
									$('.wcgs-carousel').addClass('vertically-center');
								};
								$('.gallery-navigation-carousel-wrapper').css({ 'width': vertical_thumb_width, 'maxHeight': maxHeight });
								$('.wcgs-carousel .swiper-slide').css('minHeight', maxHeight);
							}, 200)
						}
					}
				});
				var carousel_items = $('.wcgs-carousel.swiper:not(.swiper-initialized) .wcgs-slider-image').length;
				if (carousel_items > 0) {
					var thumbnails_item_show_type = typeof settings.thumbnails_item_show_type != 'undefined' && settings.thumbnails_item_show_type ? settings.thumbnails_item_show_type : 'auto';
					// Parse the settings for thumbnails_item_to_show.
					var thumbnails_item_to_show = parseInt(settings.thumbnails_item_to_show);
					if (thumbnails_item_show_type == 'auto' && gallery_layout == 'vertical') {
						thumbnails_item_to_show = 'auto';
					}
					wcgs_swiper_thumb = new SwiperSlide(".gallery-navigation-carousel", {
						slidesPerView: thumbnails_item_to_show,
						direction: gallery_layout,
						loop: infinite_loop,
						autoplay: autoplay ? ({ delay: autoplay_interval, pauseOnMouseEnter: false }) : false,
						watchSlidesVisibility: true,
						watchSlidesProgress: true,
						autoHeight: false,
						watchOverflow: true,
						spaceBetween: parseInt(thumbnails_sliders_space),
						freeMode: free_mode,
						mousewheel: mouse_wheel,
						simulateTouch: true,
						a11y: accessibility ? ({
							prevSlideMessage: 'Previous slide',
							nextSlideMessage: 'Next slide',
						}) : false,
						on: {
							afterInit: function () {
								setTimeout(() => {
									$('#wpgs-gallery').removeClass('wcgs-swiper-before-init');
								}, 400);
							},
						}
					});

					if ('vertical' == slide_orientation) {
						adaptive_height = true;
					}
					wcgs_swiper_gallery = new SwiperSlide(".wcgs-carousel.swiper", {
						autoplay: autoplay ? ({ delay: autoplay_interval }) : false,
						autoHeight: adaptive_height,
						direction: slide_orientation,
						slidesPerView: 1,
						mousewheel: mouse_wheel,
						spaceBetween: 0,
						loop: infinite_loop,
						effect: settings.fade_slide,
						speed: parseInt(speed),
						observer: true,
						observeParents: true,
						watchOverflow: true,
						// scrollbar: {
						// 	el: '.swiper-scrollbar',
						// 	draggable: true,
						// },
						a11y: accessibility ? ({
							prevSlideMessage: 'Previous slide',
							nextSlideMessage: 'Next slide',
						}) : false,
						navigation: navigation ? ({
							nextEl: ".wcgs-carousel .wcgs-swiper-button-next",
							prevEl: ".wcgs-carousel .wcgs-swiper-button-prev",
						}) : (settings.thumbnailnavigation == 1) ? ({
							nextEl: ".gallery-navigation-carousel .wcgs-swiper-button-next",
							prevEl: ".gallery-navigation-carousel .wcgs-swiper-button-prev",
						}) : false,
						pagination: pagination ? ({
							el: '.wcgs-carousel .swiper-pagination',
							type: pagination_type,
							// type: 'custom',
							// type: 'progressbar',
							// type: 'fraction',
							clickable: true,
							dynamicBullets: dynamicBullets,
							renderBullet: function (index, className) {
								return '<span class="' + className + '"><span class="number">' + (index + 1) + '</span></span>';
							},
						}) : false,
						thumbs: {
							swiper: wcgs_swiper_thumb,
						},
					});
					// Autoplay Stop on hover.
					if (autoplay) {
						$(document).find('.wcgs-carousel').on('mouseenter', function () {
							wcgs_swiper_gallery.autoplay.stop();
							wcgs_swiper_thumb.autoplay.stop();
						});
						$(document).find('.wcgs-carousel').on('mouseleave', function () {
							$(document).find('.wcgs_xzoom-source, .wcgs_xzoom-lens').on('mouseenter', function () {
								wcgs_swiper_gallery.autoplay.stop();
								wcgs_swiper_thumb.autoplay.stop();
							});
							$(document).find('.wcgs_xzoom-source, .wcgs_xzoom-lens').on('mouseleave', function () {
								wcgs_swiper_gallery.autoplay.start();
								wcgs_swiper_thumb.autoplay.start();
							});
						});
					}
					checkArrowsVisibility(wcgs_swiper_thumb);
					if (navigation) {
						$('.gallery-navigation-carousel .wcgs-swiper-button-next').on('click', function () {
							$('.wcgs-carousel .wcgs-swiper-button-next').trigger('click');
						});
						$('.gallery-navigation-carousel .wcgs-swiper-button-prev').on('click', function () {
							$('.wcgs-carousel .wcgs-swiper-button-prev').trigger('click');
						});
					}
					// SlideChange trigger.
					if (thumbnail_style == 'bottom_line') {
						wcgs_swiper_thumb.on('sliderMove', function (swiper, event) {
							setTimeout(function () {
								if ('vertical' == settings.gallery_layout || 'vertical_right' == settings.gallery_layout) {

									let active_thumb_position = $(document).find('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position() && typeof $(document).find('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position().top !== 'undefined' ? $(document).find('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position().top : -162;

									active_thumb_position = active_thumb_position + wcgs_swiper_thumb.translate;
									$(document).find('.gallery-navigation-carousel-wrapper .wcgs-border-bottom').css({ top: active_thumb_position });
									// }
								} else {
									var active_thumb_position = $(document).find('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position() && typeof $(document).find('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position().left !== 'undefined' ? $(document).find('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position().left : -162;
									active_thumb_position = active_thumb_position + wcgs_swiper_thumb.translate;
									$('.gallery-navigation-carousel-wrapper .wcgs-border-bottom').css({ left: active_thumb_position });
								}
							}, 600);
						});
					}
					wcgs_swiper_gallery.on('slideChange', function () {
						//	var currentSlide = wcgs_swiper_gallery.activeIndex;
						var previousIndex = wcgs_swiper_gallery.previousIndex;
						var $previousItem = $('.wcgs-carousel .swiper-slide').eq(previousIndex);
						// Thumbnails bottom line animations like apple.
						if (thumbnail_style == 'bottom_line') {
							if ('vertical' == settings.gallery_layout || 'vertical_right' == settings.gallery_layout) {
								var active_thumb_position = $('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position().top;
								active_thumb_position = active_thumb_position + wcgs_swiper_thumb.translate;
								$('.gallery-navigation-carousel-wrapper .wcgs-border-bottom').css({ top: active_thumb_position });
							} else {
								var active_thumb_position = $('.gallery-navigation-carousel-wrapper .swiper-slide-visible.swiper-slide-thumb-active').position().left;
								active_thumb_position = active_thumb_position + wcgs_swiper_thumb.translate;
								$('.gallery-navigation-carousel-wrapper .wcgs-border-bottom').css({ left: active_thumb_position });
							}
						}
						// Delayed execution to ensure proper handling.
						setTimeout(function () {
							// Find the current slide's video elements.
							var videos = $(document).find('.wcgs-carousel .swiper-slide.swiper-slide-active');
							// Set the volume of the video to a predefined value.
							if (videos.find('video').length > 0 && 'undefined' != typeof videos.find('video')[0].volume) {
								videos.find('video')[0].volume = wcgs_vol;
							}
							// Check if auto playing videos on slide transition is enabled.
							if (settings.autoplay_video_on_sliding == 1) {
								// Handle videos in iframe.
								if (videos.find('.wcgs-iframe').length > 0) {
									// Check and set data-src attribute if missing.
									if (!videos.find('.wcgs-iframe').attr('data-src')) {
										videos.find('.wcgs-iframe').attr('data-src', videos.find('.wcgs-iframe').attr('src'));
									}
									// Get the source of the iframe.
									var iframe_src = videos.find('.wcgs-iframe').attr('data-src');
									// Repeat the video using a function and obtain the repeat_video variable.
									var repeat_video = repeat_video_loop(iframe_src);
									// Handle YouTube videos and set volume and play.
									if (videos && videos.find('.wcgs-youtube-video').length > 0) {
										var $unique_id = videos.find('.wcgs-youtube-video').attr('data-unique-id');
										if ($.isFunction(window[repeat_video + $unique_id].playVideo)) {
											window[repeat_video + $unique_id].playVideo();
											window[repeat_video + $unique_id].mute();
										}

									} else {
										// Handle non-YouTube videos in the iframe.
										if (videos.find('.facebook-iframe').length < 1) {
											repeat_video = settings.video_looping == 1 ? "&playlist=" + repeat_video : '';
											videos.find('.wcgs-iframe')[0].src = iframe_src + "?autoplay=1&mute=1&loop=1&muted=1" + repeat_video;
										}
									}
								} else if (videos.find('video').length > 0) {
									// Handle videos directly embedded in video elements.
									if (settings.video_looping == 1) {
										videos.find('video').attr('loop', true);
									}
									videos.find('video')[0].muted = "muted";
									// Play the video
									videos.find('video')[0].play();
								}

								// Handle video controls and autoplay settings.
								if (settings.autoplay_video_on_sliding == 1 && typeof settings.video_controls != 'undefined' && settings.video_controls != 1) {
									if (videos.find('video').length > 0) {
										videos.parents('.wcgs-carousel').addClass('video-controls-none'); // Add class to disable click event.
									} else {
										videos.parents('.wcgs-carousel').removeClass('video-controls-none');
									}
								}
								//  Adjust swiper pagination.
								if (videos.find('.wcgs-iframe').length > 0 || videos.find('video').length > 0) {
									$('.wcgs-carousel .swiper-pagination').css({ "bottom": "-7px" });
								} else {
									$('.wcgs-carousel .swiper-pagination').css({ "bottom": "0" });
								}
							}
							// Check if the currently active slide contains an iframe, YouTube video, or video element.
							if ($($previousItem).find('iframe').length > 0 || $($previousItem).find('.wcgs-youtube-video').length > 0 || $($previousItem).find('video').length > 0) {
								// Check if the currently active slide contains a YouTube video.
								if ($($previousItem).find('.wcgs-youtube-video').length > 0) {
									// Get the video ID from data attribute.
									var video_id = $($previousItem).find('.wcgs-youtube-video').data('video-id');
									var $unique_id = $($previousItem).find('.wcgs-youtube-video').attr('data-unique-id');
									// Check if the video ID exists in the players object.
									if (window.hasOwnProperty(video_id + $unique_id)) {
										// Check if the player's pauseVideo function exists.
										if (window[video_id + $unique_id] && $.isFunction(window[video_id + $unique_id].pauseVideo)) {
											// Pause the YouTube video.
											window[video_id + $unique_id].setVolume(wcgs_vol * 100);
											window[video_id + $unique_id].pauseVideo();
										} else {
											// Stop the YouTube video.
											if ($.isFunction(window[video_id + $unique_id].stopVideo)) {
												window[video_id + $unique_id].stopVideo();
											}
										}
									}
								} else {
									// If it's not a YouTube video, stop all videos.
									stopVideos($previousItem);
								}
							}


						}, 500); // Delay of 100 milliseconds for smooth execution
					});
					setTimeout(() => {
						if ('vertical' == settings.gallery_layout || 'vertical_right' == settings.gallery_layout) {
							var active_slide_height = $(document).find('.gallery-navigation-carousel-wrapper .wcgs-thumb.swiper-slide-active').height();
							$('.gallery-navigation-carousel-wrapper .wcgs-border-bottom').css('height', active_slide_height);
						} else {
							var active_slide_width = $(document).find('.gallery-navigation-carousel-wrapper .wcgs-thumb.swiper-slide-active').width();
							$('.gallery-navigation-carousel-wrapper .wcgs-border-bottom').css('width', active_slide_width);
						}
						// Thumbnails Activate on mouseover. Default: Click.
						if (thumb_active_on == 'mouseover') {
							$(document).find('.wcgs-thumb').on('mouseenter', function () {
								if (infinite_loop) {
									let index = $(this).data('swiper-slide-index');
									wcgs_swiper_gallery.slideToLoop(index);
								} else {
									let index = $(this).index();
									wcgs_swiper_gallery.slideTo(index);
								}
							});
							$(document).find('.wcgs-swiper-arrow').on('mouseenter', function () {
								$(this).trigger('click');
							});
						}
						// autoPlay video on first time page load.
						var videos = $('.wcgs-carousel .swiper-slide.swiper-slide-active');
						// Check if auto playing videos on slide transition is enabled.
						if (settings.autoplay_video_on_sliding == 1) {
							// Handle videos in iframe.
							if (videos.find('.wcgs-iframe').length > 0) {
								// Check and set data-src attribute if missing.
								if (!videos.find('.wcgs-iframe').attr('data-src')) {
									videos.find('.wcgs-iframe').attr('data-src', videos.find('.wcgs-iframe').attr('src'));
								}
								// Get the source of the iframe.
								var iframe_src = videos.find('.wcgs-iframe').attr('data-src');
								// Repeat the video using a function and obtain the repeat_video variable.
								var repeat_video = repeat_video_loop(iframe_src);
								// Handle YouTube videos play.
								if (videos && videos.find('.wcgs-youtube-video').length > 0) {
									var checkPlayVideo = setInterval(function () {
										var $unique_id = videos.find('.wcgs-youtube-video').attr('data-unique-id');
										if (window[repeat_video + $unique_id] && $.isFunction(window[repeat_video + $unique_id].playVideo)) {
											clearInterval(checkPlayVideo); // Clear the interval once YT object is available.
											window[repeat_video + $unique_id].playVideo();
											window[repeat_video + $unique_id].mute();
										}
									}, 300); // Check every 300 milliseconds.
								} else {
									// Handle non-YouTube videos in the iframe.
									if (videos && videos.find('.facebook-iframe').length < 1) {
										repeat_video = settings.video_looping == 1 ? "&playlist=" + repeat_video : '';
										videos.find('.wcgs-iframe')[0].src = iframe_src + "?autoplay=1&mute=1&loop=1&muted=1" + repeat_video;
									}
								}
								// Adjust slick dots position for video visibility
								$('.wcgs-carousel .swiper-pagination').css({ "bottom": "-7px" });

							} else if (videos && videos.find('video').length > 0) {
								// Handle videos directly embedded in video elements.
								if (settings.video_looping == 1) {
									videos.find('video').attr('loop', true);
								}
								videos.find('video')[0].muted = "muted";
								// Play the video
								videos.find('video')[0].play();
							}
							// Handle video controls and autoplay settings.
							if (settings.autoplay_video_on_sliding == 1 && typeof settings.video_controls != 'undefined' && settings.video_controls != 1) {
								if (videos.find('video') && videos.find('video').length > 0) {
									videos.parents('.wcgs-carousel').addClass('video-controls-none'); // Add class to disable click event.
								} else {
									videos.parents('.wcgs-carousel').removeClass('video-controls-none');
								}
							}
							// Adjust Swiper dots position for video visibility.
							if (videos.find('.wcgs-iframe').length > 0 || videos.find('video').length > 0) {
								$('.wcgs-carousel .swiper-pagination').css({ "bottom": "-7px" });
							} else {
								$('.wcgs-carousel .swiper-pagination').css({ "bottom": "0" });
							}
						}
					}, 1000);
					var pagination_visibility = (settings.pagination_visibility == 'hover') ? true : false;
					if (pagination && (settings.pagination_visibility == 'always' || settings.pagination_visibility == 'hover')) {
						setTimeout(() => {
							$(".video-js .vjs-control-bar").css({ bottom: '10px' });
						}, 1000);
					}
					if (pagination_visibility) {
						$(".wcgs-carousel .swiper-pagination").hide();
						$("#wpgs-gallery .wcgs-carousel").on({
							mouseenter: function () {
								$(".wcgs-carousel .swiper-pagination").show();
							},
							mouseleave: function () {
								$(".wcgs-carousel .swiper-pagination").hide();
							}
						});
					}
					var navigation_visibility = (settings.navigation_visibility == 'hover') ? true : false;
					if (navigation_visibility && wcgs_img_count > 1) {
						$(".wcgs-carousel .wcgs-swiper-arrow").hide()
						$("#wpgs-gallery .wcgs-carousel").on({
							mouseenter: function () {
								$(".wcgs-carousel .wcgs-swiper-arrow").show();
							},
							mouseleave: function () {
								$(".wcgs-carousel .wcgs-swiper-arrow").hide();
							}
						});
					}
					if (settings.lightbox == '1') {
						var lightbox_icon_position = wcgs_object.wcgs_settings.lightbox_icon_position;
						var lightbox_icon = (wcgs_object.wcgs_settings.lightbox_icon) ? wcgs_object.wcgs_settings.lightbox_icon : 'search';
						// Light box icon updated.
						switch (lightbox_icon) {
							case 'search-plus':
								lightbox_icon = 'zoom-in-1';
								break;
							case 'angle-right':
								lightbox_icon = 'right-open-3';
								break;
							case 'arrows-alt':
								lightbox_icon = 'resize-full-2';
								break;
							case 'expand':
								lightbox_icon = 'resize-full';
								break;
							// Add more cases if needed
							default:
								lightbox_icon = lightbox_icon;
								break;
						}
						if (!$('#wpgs-gallery .wcgs-carousel .wcgs-lightbox').length) {
							$('#wpgs-gallery .wcgs-carousel').append('<div class="wcgs-lightbox ' + lightbox_icon_position + '"><a href="javascript:;"><span class="sp-wgsp-icon-' + lightbox_icon + '"></span></a></div>');
						}
					}
				}
			}
			initialize_self_hosted_video();
		}
		var isPreloader = (settings.preloader == 1) ? true : false;
		if (isPreloader) {
			if (!$('.wcgs-gallery-preloader').length) {
				$('#wpgs-gallery').append('<div class="wcgs-gallery-preloader"></div>');
			}
		}
		function stickyNavController() {
			var stickyActiveDown = false,
				activeSticky = false,
				bottomedOut = false,
				scrollOffset = 0;
			$(window).on('scroll', function () {
				var windowTop      = $(window).scrollTop(),
					navItemsHeight = $(document).find('.wcgs-carousel').outerHeight(true),
					navControllerHeight = $(document).find('.anchor_navigation_wrapper').outerHeight(true),
					navItemsTop      = $(document).find('.wcgs-carousel').offset().top,
					navControllerTop = $(document).find('.anchor_navigation_wrapper').offset().top,
					navItemsBottom   = navItemsTop + navItemsHeight,
					navControllerBottom = navControllerTop + navControllerHeight;

				if (navItemsBottom - navControllerHeight - scrollOffset <= windowTop) {
					$('.spf-swatch-tooltip').removeClass('spf-swatch-tooltip-hidden');
					return;
				}
				if (activeSticky === true && bottomedOut === false) {
					$(document).find('.anchor_navigation_wrapper').css({
						"top": (windowTop - navItemsTop + scrollOffset) + 'px'
					});
					$('.spf-swatch-tooltip').addClass('spf-swatch-tooltip-hidden');;
				}

				if (windowTop < navControllerTop && windowTop < navControllerBottom) {
					stickyActiveDown = false;
					activeSticky = true;
					$(document).find('.anchor_navigation_wrapper').css({
						"top": (windowTop - navItemsTop + scrollOffset) + 'px'
					});
					$('.spf-swatch-tooltip').addClass('spf-swatch-tooltip-hidden');;
				}

				if (stickyActiveDown === false && windowTop > navItemsTop) {
					stickyActiveDown = true;
					activeSticky = true;
					bottomedOut  = false;
				}

				if (stickyActiveDown === false && navItemsTop > windowTop) {
					stickyActiveDown = false;
					activeSticky = false;
					bottomedOut  = false;
					$(document).find('.anchor_navigation_wrapper').removeAttr("style");
				}
			});
			$(document).find('.anchor_navigation_wrapper a').on('click', function (event) {
				event.preventDefault();
				if (this.hash !== "") {
					var hash = this.hash;
					$(document).find('.anchor_navigation_wrapper a').removeClass('active');
					$(this).addClass('active');
					$(document).find('html, body').animate({
						scrollTop: $(hash).offset().top
					}, 300);
				}
			})
		}

		function setCurrentControllerItem() {
			// Highlight the active link based on scroll position.
			$(window).on('scroll', function () {
				var scrollPosition = $(this).scrollTop();
				$(document).find('.wcgs-grid-template-slide').each(function () {
					var sectionTop = $(this).offset().top - 10; // Adjust for better accuracy.
					var sectionBottom = sectionTop + $(this).outerHeight();
					if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
						var currentId = $(this).attr('id');
						$(document).find('.anchor_navigation_wrapper a').removeClass('active');
						$(document).find('.anchor_navigation_wrapper a[href="#' + currentId + '"]').addClass('active');
					}
				});
			});
			var scrollPosition = $(window).scrollTop();
			$(document).find('.wcgs-grid-template-slide').each(function () {
				var sectionTop = $(this).offset().top; // Adjust for better accuracy
				var sectionBottom = sectionTop + $(this).outerHeight();
				if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
					var currentId = $(this).attr('id');
					$(document).find('.anchor_navigation_wrapper a').removeClass('active');
					$(document).find('.anchor_navigation_wrapper a[href="#' + currentId + '"]').addClass('active');
				} else {
					var currentId = $(this).attr('id');
					$(document).find('.anchor_navigation_wrapper a').removeClass('active');
					$(document).find('.anchor_navigation_wrapper a').eq(0).addClass('active');
				}
			});
			$(window).scroll();
		}
		if ($is_anchor_navigation) {
			stickyNavController();
			setCurrentControllerItem();
		}
		// Looping a video is allowing the video to play in a repeat mode.
		function repeat_video_loop(url) {
			// Look for a string with 'youtube', then whatever, then a
			// Forward slash and a group of digits.
			var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
			var match = url.match(regExp);
			if (match && match[2].length == 11) {
				return (match[2]);
			} else {
				// Look for a string with 'vimeo', then whatever, then a
				// Forward slash and a group of digits.
				var match = /vimeo.*\/(\d+)/i.exec(url);
				// If the match isn't null (i.e. it matched).
				if (match) {
					// The grouped/matched digits from the regex.
					return match[1];
				}
			}
		}
		// Add video icon on thumbnail.
		function videoIcon() {
			$('.wcgs-slider-image, .wcgs-thumb').each(function () {
				var icon = $(this).find('img').data('type');
				if (icon && !$(this).find('.wcgs-video-icon').length) {
					$(this).append('<div class="wcgs-video-icon"></div>');
				}
			})
		}
		// Zoom initializer.
		function zoomEffect() {
			function calculateZoomValue($arg) {
				return 1 - ($arg - 1);
			}
			$('.wcgs_xzoom').each(function () {
				var _this = $(this);
				var mouse_wheel_zoom = settings.mouse_wheel_zoom !== undefined && settings.mouse_wheel_zoom == 1 ? true : false;
				var zoom_window_distance = settings.zoom_window_distance !== undefined ? parseInt(settings.zoom_window_distance) : 10;
				var lens_shape = settings.lens_shape !== undefined ? settings.lens_shape : 'box';
				var product_image_overlay = settings.product_image_overlay !== undefined ? settings.product_image_overlay : 'blur';
				var overlay_color = settings.overlay_color !== undefined ? settings.overlay_color : '#fff';
				var zoom_level = settings.zoom_level !== undefined ? parseFloat(settings.zoom_level) : 2;
				zoom_level = calculateZoomValue(zoom_level);
				var lens_opacity = settings.lens_opacity !== undefined ? settings.lens_opacity : '0.3';
				var lens_color = settings.lens_color !== undefined ? settings.lens_color : '#fff';
				var zoom_size_type = settings.zoom_size_type !== undefined ? settings.zoom_size_type : 'auto';
				var zoom_size_width = 'auto';
				var zoom_size_height = 'auto';
				if ('custom' === zoom_size_type) {
					zoom_size_width = settings.zoom_size !== undefined && settings.zoom_size['width'] > 0 ? settings.zoom_size['width'] : 'auto';
					zoom_size_height = settings.zoom_size['height'] !== undefined && settings.zoom_size['height'] > 0 ? settings.zoom_size['height'] : 'auto';
				}
				if ($('.wcgs-carousel').hasClass('lens')) {
					const tint_color = (product_image_overlay === 'blur') ? '#fff' : overlay_color;
					$(this).wcgs_xzoom({
						position: 'lens',
						lens: lens_color,
						tint: tint_color,
						tintOpacity: lens_opacity,
						lensShape: lens_shape,
						scroll: mouse_wheel_zoom,
						lens: lens_color,
						lensOpacity: 0,
						scroll: mouse_wheel_zoom,
						defaultScale: zoom_level,
					});
				}

				if ($('.wcgs-carousel').hasClass('in_side')) {
					$(this).wcgs_xzoom({
						position: 'inside',
						defaultScale: 0,
						lensCollision: true,
						smoothZoomMove: 12,
						scroll: mouse_wheel_zoom,
						defaultScale: zoom_level
					});
				}
				if ($('.wcgs-carousel').hasClass('right_side')) {
					const tint_color = (product_image_overlay === 'blur') ? '#fff' : overlay_color;
					zoom_window_distance = is_rtl ? -1 * zoom_window_distance : zoom_window_distance;
					$(this).wcgs_xzoom({
						position: is_rtl ? 'left' : 'right',
						mposition: 'inside',
						smoothZoomMove: 12,
						tint: tint_color,
						tintOpacity: lens_opacity,
						zoomWidth: zoom_size_width,
						zoomHeight: zoom_size_height,
						Xoffset: zoom_window_distance,
						scroll: mouse_wheel_zoom,
						lensCollision: true,
						lens: lens_color,
						lensShape: lens_shape,
						defaultScale: zoom_level,
						// smoothScale: -30,
						// smoothZoomMove: -30
					});
				}
				if (wcgs_swiper) {
					wcgs_swiper_gallery.on('setTransition', function () {
						var zoom_data = _this.data('wcgs_xzoom');
						if (zoom_data || typeof zoom_data !== 'undefined') {
							zoom_data.closezoom();
						}
					});
				}
				// Zoom close when mouse on lightbox icon.
				if (wgsp_lightbox && settings.gallery_layout != 'grid' && $(document).find('.wcgs-lightbox').length > 0) {
					$('.wcgs-carousel, .wcgs_xzoom-source, .wcgs_xzoom-lens').on('mouseenter', function () {
						$(document).mousemove(function (e) {
							// Get the mouse position.
							var mouseX = e.pageX;
							var mouseY = e.pageY;
							// Get the element position.
							var elementX = $(document).find('.wcgs-lightbox').offset().left;
							var elementY = $(document).find('.wcgs-lightbox').offset().top;

							// Get the element dimensions.
							var elementWidth = $(document).find('.wcgs-lightbox').outerWidth();
							var elementHeight = $(document).find('.wcgs-lightbox').outerHeight();

							// Check if the mouse is over the element
							if (mouseX >= elementX && mouseX <= elementX + elementWidth &&
								mouseY >= elementY && mouseY <= elementY + elementHeight) {
								// Trigger your action here
								var zoom_data = _this.data('wcgs_xzoom');
								if (zoom_data || typeof zoom_data !== 'undefined') {
									zoom_data.closezoom();
								}
							}
						});
					});
				}
			});

			if ($(window).width() < 480 && settings.mobile_zoom === 1) {
				return '';
			}
		}
		// Add lightbox with gallery.
		function wcgsLightbox() {
			var lightbox = (settings.lightbox == 1) ? true : false;
			if (lightbox && typeof $.fancybox !== 'undefined') {
				var gl_btns = [
					"zoom",
				];
				if (settings.gallery_dl_btn == 1) {
					gl_btns.push("download");
				}
				if (settings.gallery_fs_btn == 1) {
					gl_btns.push("fullScreen");
				}
				if (settings.gallery_share == 1) {
					gl_btns.push("share");
				}
				if (settings.side_gallery_btn == 1) {
					gl_btns.push("thumbs");
				}
				if (settings.slide_play_btn == 1) {
					gl_btns.push("slideShow");
				}
				gl_btns.push("close");
				var counter = (settings.l_img_counter == 1) ? true : false;

				$(document).find('.wcgs-slider-lightbox').fancybox({
					transitionEffect: settings.lightbox_sliding_effect,
					// selector: '.wcgs-carousel .wcgs-slider-image',
					baseClass: 'wcgs-fancybox-wrapper',
					buttons: gl_btns,
					caption: function () {
						if (settings.lightbox_caption == 1) {
							var caption = $(this).parent('.wcgs-slider-image ').find('img').data('cap') || '';
						} else {
							caption = '';
						}
						return caption;
					},
					afterShow: function (instance, current) {
						// Thumbnail in popup.
						$(document).find('.wcgs-carousel .wcgs-slider-image img').each(function (i) {
							var imageUrl = $(this).attr('data-lazy'),
								thumbnail_selector = $('.wcgs-fancybox-wrapper .fancybox-thumbs__list a:nth(' + i + ')'),
								thumbnail_url = thumbnail_selector.attr('style');
							if (imageUrl && thumbnail_selector.length > 0 && thumbnail_url.indexOf('spinner.svg') >= 0) {
								thumbnail_selector.css("background-image", "url(" + imageUrl + ")");
							}
						})
						$(".wcgs-fancybox-wrapper~.elementor-lightbox").remove();
					},
					infobar: counter,
					closeClickOutside: true,
					loop: true,
					thumbs: {
						autoStart: (settings.thumb_gallery_show == 1) ? true : false,
						axis: 'x',
					},
					mobile: {
						clickContent: function (t, e) {
							return "image" === t.type && "close";
						},
						clickSlide: function (t, e) {
							return "image" === t.type && "close";
						},
					},
				});
			}
		}
		// Grayscale.
		function addGrayscale() {
			if (settings.grayscale !== 'gray_off') {
				var grayClass = settings.grayscale;
				$('.wcgs-slider-image img, .wcgs-thumb img').addClass('' + grayClass + '');
			}
		}
		function wcgs_initialize() {
			var gallery_width = settings.gallery_width;
			var woocommerce_single_product_width = $(wcgs_product_wrapper).width();
			if ($('body').hasClass('theme-flatsome')) {
				var woocommerce_single_product_width = $('.single-product .product .row.content-row').width();
			}

			gallery_w = gallery_width;
			var summary_w = (100 - gallery_width);
			if (summary_w < 20) {
				summary_w = '';
			}

			if ($(window).width() > 992) {
				$('#wpgs-gallery ~ .summary').css('maxWidth', 'calc(' + summary_w + '% - 100px)');
			}
			if (settings.gallery_layout == 'vertical' || settings.gallery_layout == 'vertical_right' || settings.gallery_layout == 'hide_thumb' || gallery_width > 100) {
				gallery_w = ((gallery_width * woocommerce_single_product_width) / 100);
				summary_w = ((100 - gallery_width) * woocommerce_single_product_width) / 100 - 50;
				// Specific width in pixel for desktop
				if (gallery_width > 100) {
					gallery_w = gallery_width;
					summary_w = (woocommerce_single_product_width - gallery_width - 50);
				}
				if (summary_w < 20) {
					summary_w = '';
				}
				if ($(window).width() > 992) {
					$('#wpgs-gallery ~ .summary').css('maxWidth', summary_w);
				}
			}
			// Hestia theme support.
			if ($('.wcgs-wcgs-woocommerce-product-gallery').parents('.hestia-product-image-wrap').length) {
				var gallery_hestia_width = $('.wcgs-wcgs-woocommerce-product-gallery').parents('.hestia-product-image-wrap').width();
				if (typeof gallery_hestia_width === "number") {
					gallery_w = gallery_hestia_width;
				}
			}

			// Divi builder width issue.
			if ($('body').hasClass('et_divi_builder') || $('body').hasClass('theme-Divi')) {
				var gallery_divi_width = $('.et-db #et-boc .et-l .et_pb_gutters3 .et_pb_column_1_2').width();
				if (typeof gallery_divi_width === "number") {
					gallery_w = gallery_divi_width;
				}
			}

			if ($(window).width() < 992) {
				if (settings.gallery_responsive_width.width > 0) {
					gallery_w = settings.gallery_responsive_width.width;
				}
			}
			if ($(window).width() < 768) {
				gallery_w = settings.gallery_responsive_width.height;
			}
			if ($(window).width() < 480) {
				gallery_w = settings.gallery_responsive_width.height2;
			}
			if (wcgs_swiper) {
				wcgs_slider_func(gallery_w);
			} else {
				wcgs_grid_init(gallery_w);
			}
		}
		wcgs_initialize();

		var orentationchange = false;
		$(window).on("orientationchange", function () {
			orentationchange = true;
		});
		var window_width = $(window).width();
		$(window).on('resize', function () {
			if ($(this).width() !== window_width || orentationchange) {
				window_width = $(this).width();
				wcgs_initialize();
				orentationchange = false;
			}
		});
		$('#wpgs-gallery').wpgspimagesLoaded().then(function () {
			setTimeout(function () {
				$(".wcgs-gallery-preloader").css({ "opacity": 0, "z-index": -99 });
			}, 200)
		});
		videoIcon();
		if (wcgs_object.wcgs_settings.zoom == "1" && $(document).find('.wcgs-carousel').hasClass('wcgs_xzoom_wrapper')) {
			zoomEffect();
		}
		function uniqueMultidimensionalArray(arr, key) {
			var uniqueArray = [];
			var uniqueKeys = [];

			$.each(arr, function (index, item) {
				// Check if the key value is not already in the uniqueKeys array
				if ($.inArray(item[key], uniqueKeys) === -1) {
					uniqueKeys.push(item[key]); // Add the key value to the uniqueKeys array
					uniqueArray.push(item);      // Add the entire item to the uniqueArray
				}
			});

			return uniqueArray;
		}
		wcgsLightbox();
		addGrayscale();
		// On change Variations get variations data.
		$(document).on('change', '.variations select', function () {
			var wcgs_vol = typeof settings.video_volume != 'undefined' ? settings.video_volume : 0.5;
			var lightbox = (settings.lightbox == '1') ? true : false;
			var $items_to_show = settings.gallery_item_to_show;
			var $gallery_expansion = settings.gallery_expansion;
			var variations_items = [];
			var variationsArray = {};
			$('.variations tr').each(function (i) {
				var attributeName = $(this).find('select').data('attribute_name');
				var attributeValue = $(this).find('select').val();
				if (attributeValue) {
					variationsArray[attributeName] = attributeValue;
				}
			});
			var $row_index = 0;
			if (wcgs_object.wcgs_data && wcgs_object.wcgs_data.length > 0) {
				var data = wcgs_object.wcgs_data;
				$.each(data, function (i, v) {
					var v0 = JSON.stringify(v[0]) == '[]' ? '{}' : JSON.stringify(v[0]);
					var applied_variation = JSON.stringify(variationsArray);
					applied_variation = $single_combination !== 'all' ? applied_variation.slice(1, -1) : applied_variation;

					if ($.isEmptyObject(variationsArray)) {
						if (v0 === JSON.stringify(variationsArray)) {
							var response = v[1];
							if (response.length > 0) {
								$.merge(variations_items, response);
							}
						}
					} else {
						if (v0.indexOf(applied_variation) !== -1) {
							var response = v[1];
							if (response.length > 0) {
								$.merge(variations_items, response);
							}
						}
					}
				});
				if (variations_items.length > 0) {
					variations_items = uniqueMultidimensionalArray(variations_items, 'full_url');
					$('.wcgs-gallery-preloader').css('z-index', 999);
					$('.wcgs-gallery-preloader').css('opacity', 0.4);
					if (wcgs_swiper) {
						wcgs_swiper_thumb.destroy(true);
						wcgs_swiper_gallery.destroy(true);
						$('#wpgs-gallery .wcgs-carousel .swiper-wrapper *, #wpgs-gallery .gallery-navigation-carousel .swiper-wrapper > *').remove();
						$('.wcgs-carousel, .gallery-navigation-carousel').css('opacity', 0);
					} else {
						$('#wpgs-gallery .wcgs-carousel .wcgs-grid-template *, #wpgs-gallery .gallery-navigation-carousel .wcgs-grid-template > *').remove();
						$('.wcgs-carousel, .gallery-navigation-carousel').css('opacity', 0);
						if ($is_modern_layout) {
							$('#wpgs-gallery .wcgs-carousel .wcgs-grid-template-container > .wcgs-grid-template-slide').remove();
							first_slide_moved = false;
						}
						if ($is_anchor_navigation) {
							$('.anchor_navigation_wrapper *').remove();
						}
					}
					$('#wpgs-gallery').addClass('wcgs-transition-none');
					var gallery = variations_items;
					gallery.forEach(function (item, index) {
						if (item != null) {
							var wcgs_item_class = ('specific' == $gallery_item && $row_index >= $items_to_show) ? 'wcgs-hidden-item' : 'wcgs-shown-item';

							++$row_index;
							var caption = (item.cap.length > 0) ? item.cap : '';
							var alt_text = (item.alt_text.length > 0) ? item.alt_text : '';
							var checkVideo = item.hasOwnProperty('video') ? true : false;
							var lightbox_thumb = '';
							var url_2x = '';
							if (item.img_2x_url) {
								url_2x = `srcset="${item.url}, ${item.img_2x_url} 2x"`;
							}
							var thumb_url_2x = '';
							if (item.thumb_url_2x) {
								thumb_url_2x = `srcset="${item.thumb_url}, ${item.thumb_url_2x} 2x"`;
							}
							if (checkVideo) {
								var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
								var video = item.video;
								if (regex.test(video)) {
									var youtubeCheck = (video.indexOf('youtub') > -1) ? true : false;
									var vimeoCheck = (video.indexOf('vimeo') > -1) ? true : false;
									var dailyMotionCheck = (video.indexOf('dailymotion') > -1) ? true : false;
									var facebookCheck = (video.indexOf('facebook') > -1) ? true : false;
									var video_id = '',
										video_type = '',
										iframe = '',
										style = '';
									if (youtubeCheck) {
										if (video.indexOf('shorts') > -1) {
											var regex = /\/shorts\/([a-zA-Z0-9_-]+)/;
											var match = video.match(regex);
											var id = match ? match[1] : '';
										} else {
											var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
											var match = video.match(regExp);
											var id = (match && match[7].length == 11) ? match[7] : false;
										}
										video_id = 'data-videoid="' + id + '"';
										video_type = 'data-type="youtube"';
										if (!video_only_popup) {
											iframe = '<div class="skip-lazy wcgs-iframe wcgs-youtube-video" data-video-id="' + id + '"></div>';
											style = ' style="visibility: hidden;"';
										}
									}
									if (vimeoCheck) {
										var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
										var match = video.match(regExp);
										var id = match[5];
										video_id = 'data-videoid="' + id + '"';
										video_type = 'data-type="vimeo"';
										lightbox_thumb = 'data-thumb="' + item.url + '"';
										if (!video_only_popup) {
											iframe = '<iframe class="skip-lazy wcgs-iframe" src="//player.vimeo.com/video/' + id + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
											style = ' style="visibility: hidden;"';
										}
									}
									if (dailyMotionCheck) {
										video_id = 'data-videoid="' + video + '"';
										video_type = 'data-type="dailymotion"';
										lightbox_thumb = 'data-thumb="' + item.url + '"';
										if (!video_only_popup) {
											iframe = '<iframe class="skip-lazy wcgs-iframe" src="' + video + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
											style = ' style="visibility: hidden;"';
										}
									}
									if (facebookCheck) {
										var id = video;
										video_id = 'data-videoid="' + video + '"';
										video_type = 'data-type="facebook"';
										lightbox_thumb = 'data-thumb="' + item.url + '"';
										if (!video_only_popup) {
											iframe = '<iframe class="skip-lazy wcgs-iframe facebook-iframe" src="' + id + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
											style = ' style="visibility: hidden;"';
										}
									}
									if (!youtubeCheck && !vimeoCheck && !dailyMotionCheck && !facebookCheck) {
										video_id = 'data-videomp4="' + video + '"';
										video_type = 'data-type="html5video"';
										var controls = 'controls';
										lightbox_thumb = 'data-thumb="' + item.url + '"';
										var videoItemClass = ''
										if (settings.autoplay_video_on_sliding == 1) { // If video autoplay enabled. Show/hide controls work.
											controls = typeof settings.video_controls == 'undefined' || settings.video_controls == 1 ? 'controls' : '';
										}
										if (!video_only_popup) {
											iframe = '<div class="wcgs-video-self-hosted"> <video data-setup="{}" playsinline class="video-js" ' + controls + ' volume="' + wcgs_vol + '" width="100%" height="100%"><source src="' + video + '" type="video/mp4"></video></div>';
											style = ' style="visibility: hidden;"';
										}
									}
									if (wcgs_swiper) {
										$('#wpgs-gallery .wcgs-carousel .swiper-wrapper').append('<div class="swiper-slide"><div class="wcgs-slider-image"><a  class="wcgs-slider-lightbox" ' + lightbox_thumb + ' href="' + video + '" data-fancybox="view"></a><div class="wcgs-iframe-wrapper">' + iframe + '<img ' + style + ' class="skip-lazy wcgs-slider-image-tag" alt="' + alt_text + '" data-cap="' + caption + '" data-videosrc="' + video + '" src="' + item.url + '" ' + url_2x + ' ' + video_type + ' ' + video_id + ' /></div></div></div>');
										$('#wpgs-gallery .gallery-navigation-carousel .swiper-wrapper').append('<div class="wcgs-thumb swiper-slide"><img alt="' + alt_text + '" data-cap="' + caption + '" data-videosrc="' + video + '" src="' + item.thumb_url + '" ' + thumb_url_2x + ' ' + video_type + ' ' + video_id + ' /></div>');
									} else {
										$('#wpgs-gallery .wcgs-carousel .wcgs-grid-template').append('<div class="wcgs-grid-template-slide ' + wcgs_item_class + '" id="wcgs-control-item' + $row_index + '" ><div class="wcgs-slider-image wcgs-grid-image hover-enabled "><div class="wcgs-grid-lightbox"><a  class="wcgs-slider-lightbox" ' + lightbox_thumb + ' href="' + video + '" data-fancybox="view"><div class="wcgs-lightbox grid-lightbox top_right"><span class="sp-wgsp-icon-search" ></span></div></a></div><div class="wcgs-iframe-wrapper">' + iframe + '<img ' + style + ' class="skip-lazy wcgs-slider-image-tag" alt="' + alt_text + '" data-cap="' + caption + '" data-videosrc="' + video + '" src="' + item.url + '" ' + url_2x + ' ' + video_type + ' ' + video_id + ' /></div></div></div>');
										if ($is_anchor_navigation) {
											$('#wpgs-gallery .anchor_navigation_wrapper').append('<a href="#wcgs-control-item' + $row_index + '" class="anchor_navigation-link wcgs-anchor-link active"></a>');
										}
									}
								} else {
									if (wcgs_swiper) {
										$('#wpgs-gallery .wcgs-carousel .swiper-wrapper').append('<div class="swiper-slide"> <div class="wcgs-slider-image"> <div class="wcgs-grid-lightbox"><a  class="wcgs-slider-lightbox" ' + lightbox_thumb + ' href="' + video + '" data-fancybox="view"><div class="wcgs-lightbox grid-lightbox top_right"><span class="sp-wgsp-icon-search" ></span></div></a></div><img class="skip-lazy wcgs-slider-image-tag wcgs_xzoom" xoriginal="' + item.full_url + '" alt="' + alt_text + '" data-cap="' + caption + '" src="' + item.url + '" ' + url_2x + ' data-image="' + item.url + '" /></div></div>');
										$('#wpgs-gallery .gallery-navigation-carousel .swiper-wrapper').append('<div class="wcgs-thumb swiper-slide"><img alt="' + alt_text + '" data-cap="' + caption + '" src="' + item.thumb_url + '" ' + thumb_url_2x + ' data-image="' + item.url + '" /></div>');
									} else {
										$('#wpgs-gallery .wcgs-carousel .wcgs-grid-template').append('<div class="wcgs-grid-template-slide ' + wcgs_item_class + '" id="wcgs-control-item' + $row_index + '" > class="wcgs-slider-image wcgs-grid-image hover-enabled"> <div class="wcgs-grid-lightbox"><a  class="wcgs-slider-lightbox" ' + lightbox_thumb + ' href="' + video + '" data-fancybox="view"><div class="wcgs-lightbox grid-lightbox top_right"><span class="sp-wgsp-icon-search" ></span></div></a></div><img class="skip-lazy wcgs-slider-image-tag wcgs_xzoom" xoriginal="' + item.full_url + '" alt="' + alt_text + '" data-cap="' + caption + '" src="' + item.url + '" ' + url_2x + ' data-image="' + item.url + '" /></div></div>');
										if ($is_anchor_navigation) {
											$('#wpgs-gallery .anchor_navigation_wrapper').append('<a href="#wcgs-control-item' + $row_index + '" class="anchor_navigation-link wcgs-anchor-link active"></a>');
										}

									}
								}
							} else {
								if (wcgs_swiper) {
									$('#wpgs-gallery .wcgs-carousel .swiper-wrapper').append('<div class="swiper-slide"><div class="wcgs-slider-image"><a class="wcgs-slider-lightbox" href="' + item.full_url + '" data-fancybox="view"></a><img class="skip-lazy wcgs-slider-image-tag wcgs_xzoom" xoriginal="' + item.full_url + '" alt="' + alt_text + '" data-cap="' + caption + '" src="' + item.url + '" ' + url_2x + ' data-image-src="' + item.full_url + '" /></div></div>');
									$('#wpgs-gallery .gallery-navigation-carousel .swiper-wrapper').append('<div class="wcgs-thumb swiper-slide"><img class="skip-lazy wcgs-slider-image-tag" alt="' + alt_text + '" data-cap="' + caption + '" src="' + item.thumb_url + '" ' + thumb_url_2x + ' data-image="' + item.url + '" /></div>');
								} else {
									$('#wpgs-gallery .wcgs-carousel .wcgs-grid-template').append('<div class="wcgs-grid-template-slide ' + wcgs_item_class + '" id="wcgs-control-item' + $row_index + '" ><div class="wcgs-slider-image wcgs-grid-image hover-enabled"> <div class="wcgs-grid-lightbox"><a  class="wcgs-slider-lightbox" ' + lightbox_thumb + ' href="' + item.full_url + '" data-fancybox="view"><div class="wcgs-lightbox grid-lightbox top_right"><span class="sp-wgsp-icon-search" ></span></div></a></div><img class="skip-lazy wcgs-slider-image-tag wcgs_xzoom" xoriginal="' + item.full_url + '" alt="' + alt_text + '" data-cap="' + caption + '" src="' + item.url + '" ' + url_2x + ' data-image-src="' + item.full_url + '" /></div></div>');
									if ($is_anchor_navigation) {
										$('#wpgs-gallery .anchor_navigation_wrapper').append('<a href="#wcgs-control-item' + $row_index + '" class="anchor_navigation-link wcgs-anchor-link active"><span class="wcgs-anchor-text"></span></a>');
									}
								}
							}
							$('.wcgs-carousel.in_side .wcgs-slider-image').each(function () {
								var photoLength = $(this).find('.wcgs-photo').length;
								if (photoLength === 0) {
									let img_cap = $(this).find('img').data('cap');
									if (img_cap && settings.show_caption) {
										$(this).append('<div class="wcgs-slider-image-caption"><span>' + img_cap + '</span></div>')
									}
								}
							});
						}
					});
					if ($row_index > $items_to_show) {
						$('.wcgs-toggle-btn-container').show();
					} else {
						$('.wcgs-toggle-btn-container').hide();
					}
					$('#wpgs-gallery').wpgspimagesLoaded().then(function () {
						// Do stuff after images are loaded here.
						if (wcgs_swiper) {
							wcgs_slider_func(gallery_w);
						} else {
							wcgs_grid_init(gallery_w);
							if ('specific' == $gallery_item) {
								$('.wcgs-toggle-btn').find('span').text(settings.expand_collapse.expand);
								$('.wcgs-toggle-btn').find('.wgsp-icon').removeClass('sp-wgsp-icon-up-open-big').addClass('sp-wgsp-icon-down-open-big');
							}
							if (!$is_modern_layout && !$is_anchor_navigation && 'specific' == $gallery_item) {
								var totalHeight = 0;
								$('.wcgs-grid-template-slide.wcgs-shown-item').each(function (index) {
									// Process every first item in each pair (i.e., every second index)
									if (index % $grid_column === 0) {
										var $first = $(this);
										var $second = $('.wcgs-grid-template-slide.wcgs-shown-item').eq(index + 1);
										// Combine the heights of the pair.
										var combinedHeight = $first.outerHeight(true);
										if ($second.length > 0) {
											combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
										}
										totalHeight += combinedHeight;
									}

								});
								$('.wcgs-grid-template').css('height', totalHeight);
							}
						}
						setTimeout(function () {
							if (wcgs_object.wcgs_settings.zoom == "1" && $(document).find('.wcgs-carousel').hasClass('wcgs_xzoom_wrapper')) {
								zoomEffect();
							}
							videoIcon();
							addGrayscale();
							wcgsLightbox();
							$('.wcgs-gallery-preloader').animate({ 'z-index': -99, 'opacity': '0' }, 300);
						}, 500);
						players = [];
						$(document).find('.wcgs-carousel .wcgs-slider-image .wcgs-youtube-video').each(function (index) {
							$(this).attr('data-unique-id', index)
							var $unique_id = $(this).attr('data-unique-id');
							var videoId = $(this).data('video-id');
							var player = new YT.Player(this, {
								videoId: videoId,
								playerVars: {
									controls: typeof settings.yt_video_controls != 'undefined' ? settings.yt_video_controls : 1,
									//	autoplay: settings.autoplay_video_on_sliding,
									loop: typeof settings.video_looping != 'undefined' ? settings.video_looping : 0,
									modestbranding: 1,
									showinfo: 0,
									rel: typeof settings.yt_related_video != 'undefined' ? settings.yt_related_video : 0,
									fs: 1
								}
							});
							window[videoId + $unique_id] = player;
						});
					});
					$('.wcgs-carousel, .gallery-navigation-carousel').css('opacity', 1);
					if ($is_modern_layout) {
						move_first_slide();
					}
					if ($is_anchor_navigation) {
						setCurrentControllerItem();
						stickyNavController();
						var scrollPosition = $(window).scrollTop();
						var wcgs_container_position = $('.wcgs-grid-template-container').offset().top;
						if (wcgs_container_position < scrollPosition) {
							$(document).find('.anchor_navigation_wrapper a').eq(0).trigger('click');
						}
					}
					setTimeout(() => {
						$('#wpgs-gallery').removeClass('wcgs-transition-none');
					}, 600);
				}
			}
			// Fix the conflict of Variation with WooCommerce Product Bundles.
			$('.wcgs-gallery-slider .bundle_form img.wp-post-image').wc_reset_variation_attr('srcset');
		});
		var stopVideos = function (item) {
			var videos = $(item).find('video, iframe')[0];
			// var videos = document.querySelector('.swiper-slide iframe, .swiper-slide video');
			if (videos && videos.length) {
				if (videos.tagName.toLowerCase() === 'video') {
					videos.pause();
				} else {
					var src = videos.src;
					videos.src = src;
				}
			}
		};

		$('.wcgs-gallery-slider .bundle_form img.wp-post-image').removeClass('wp-post-image');
		// Fix the conflict of Variation Swatches plugin.
		$(document).on('click', '.wcgs-gallery-slider .variations .select-option.swatch-wrapper', function (e) {
			var $this = $(this);
			var $option_wrapper = $this.closest('div.select').eq(0);
			var $wc_select_box = $option_wrapper.find('select').first();
			$wc_select_box.trigger('change');
		});

		// Fix the conflict of SySwatches Variation Swatches For WooCommerce plugin.
		$(document).on('click', '.wcgs-gallery-slider .attribute-swatch .swatchinput label', function (e) {
			var $this = $(this);
			var $wc_select_box1 = $this.parents('td.value').find('select').first();
			$wc_select_box1.trigger('change');
		});
		if ('grid' == settings.gallery_layout && ! $is_anchor_navigation ) {
			if ($is_modern_layout) {
				var wcgs_expand = 0;
				// Click event handler for the toggle button
				$(".wcgs-toggle-btn").click(function () {
					var buttonText = $(this).find('span').text();
					if (wcgs_expand == 0) {
						// $('.wcgs-grid-template-slide.wcgs-hidden-item').show();
						$('.wcgs-grid-template-slide:not(.wcgs-shown-item)').removeClass('wcgs-hidden-item');
						$(this).find('span').text(settings.expand_collapse.collapse);
						$(this).find('.wgsp-icon').removeClass('sp-wgsp-icon-down-open-big').addClass('sp-wgsp-icon-up-open-big');
						wcgs_expand = 1;
					} else if (buttonText === settings.expand_collapse.expand) {
						// Toggle the visibility of .grid-template-slide.wcgs-hidden-item elements.
						$('.wcgs-grid-template-slide:not(.wcgs-shown-item)').removeClass('wcgs-hidden-item');
						$(this).find('span').text(settings.expand_collapse.collapse);
						$(this).find('.wgsp-icon').removeClass('sp-wgsp-icon-down-open-big').addClass('sp-wgsp-icon-up-open-big');
					} else {
						$('.wcgs-grid-template-slide:not(.wcgs-shown-item)').addClass('wcgs-hidden-item');
						$(this).find('span').text(settings.expand_collapse.expand);
						$(this).find('.wgsp-icon').removeClass('sp-wgsp-icon-up-open-big').addClass('sp-wgsp-icon-down-open-big');
					}
					// Call the function to adjust button position if necessary.
					// adjustButtonPosition();
				});
			} else {
				if ('specific' == $gallery_item && !$is_anchor_navigation) {
					var totalHeight = 0;
					$('.wcgs-grid-template-slide.wcgs-shown-item').each(function (index) {
						// Process every first item in each pair (i.e., every second index)
						if (index % $grid_column === 0) {
							var $first = $(this);
							var $second = $('.wcgs-grid-template-slide.wcgs-shown-item').eq(index + 1);
							// Combine the heights of the pair.
							var combinedHeight = $first.outerHeight(true);
							if ($second.length > 0) {
								combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
							}
							// Sum the height of the larger item.
							totalHeight += combinedHeight;
						}
					});
					$('.wcgs-grid-template').css('height', totalHeight);
					var wcgs_expand = 0;
					// Click event handler for the toggle button.
					$(".wcgs-toggle-btn").click(function () {
						var buttonText = $(this).find('span').text();
						var shown_item_top = $('.wcgs-grid-template-container').offset().top;
						var speed = 0.3;
						// var shown_items_height = $('.wcgs-grid-template').outerHeight();
						if (wcgs_expand == 0) {
							var totalHeight = 0;
							$('.wcgs-grid-template-slide').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide').eq(index + 1);
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}
									// Sum the height of the larger item.
									totalHeight += combinedHeight;
								}
							});
							var shownTotalHeight = 0;
							$('.wcgs-grid-template-slide.wcgs-shown-item').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide.wcgs-shown-item').eq(index + 1);
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}
									// Sum the height of the larger item.
									shownTotalHeight += combinedHeight;
								}
							});
							var hiddenItemHeight = 0;
							$('.wcgs-grid-template-slide.wcgs-hidden-item').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide.wcgs-hidden-item').eq(index + 1);
									// Combine the heights of the pair.
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}
									// Sum the height of the larger item.
									hiddenItemHeight += combinedHeight;
								}
							});
							$('.wcgs-grid-template-slide.wcgs-hidden-item').css('opacity', 1)
							$('.wcgs-grid-template').animate({ height: totalHeight }, hiddenItemHeight * speed);
							setTimeout(() => {
								$('html, body').animate({
									scrollTop: shown_item_top + shownTotalHeight - 40
								}, 300);
							}, (hiddenItemHeight * speed) * 0.22);
							$('.wcgs-toggle-btn').find('span').text(settings.expand_collapse.collapse);
							$('.wcgs-toggle-btn').find('.wgsp-icon').removeClass('sp-wgsp-icon-down-open-big').addClass('sp-wgsp-icon-up-open-big');
							wcgs_expand = 1;
						} else if (buttonText === settings.expand_collapse.expand) {
							// Toggle the visibility of elements.
							var totalHeight = 0;
							$('.wcgs-grid-template-slide').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide').eq(index + 1);
									// Combine the heights of the pair.
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}

									// Sum the height of the larger item.
									totalHeight += combinedHeight;
								}
							});
							var hiddenItemHeight = 0;
							$('.wcgs-grid-template-slide.wcgs-hidden-item').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide.wcgs-hidden-item').eq(index + 1);
									// Combine the heights of the pair.
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}
									// Sum the height of the larger item.
									hiddenItemHeight += combinedHeight;
								}
							});
							var shownTotalHeight = 0;
							$('.wcgs-grid-template-slide.wcgs-shown-item').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide.wcgs-shown-item').eq(index + 1);
									// Combine the heights of the pair.
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}
									// Sum the height of the larger item.
									shownTotalHeight += combinedHeight;
								}
							});
							setTimeout(() => {
								$('html, body').animate({
									scrollTop: shown_item_top + shownTotalHeight - 20
								}, 300);
							}, (hiddenItemHeight * speed));
							$('.wcgs-grid-template-slide.wcgs-hidden-item').css('opacity', 1)
							$('.wcgs-grid-template').animate({ height: totalHeight }, hiddenItemHeight * speed);
							$('.wcgs-toggle-btn').find('span').text(settings.expand_collapse.collapse);
							$('.wcgs-toggle-btn').find('.wgsp-icon').removeClass('sp-wgsp-icon-down-open-big').addClass('sp-wgsp-icon-up-open-big');
							$('window').trigger("scroll");
						} else {
							var totalHeight = 0;
							var wgcs_count = 0;
							var lastItemHeight = 0;
							$('.wcgs-grid-template-slide.wcgs-shown-item').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide.wcgs-shown-item').eq(index + 1);
									// Combine the heights of the pair.
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}
									// Sum the height of the larger item.
									totalHeight += combinedHeight;
									wgcs_count++;
									lastItemHeight = combinedHeight;
								}
							});
							// var scroll_top = shown_item_top + totalHeight - lastItemHeight;
							var scroll_top = shown_item_top + totalHeight - (lastItemHeight * 0.3);
							var hiddenItemHeight = 0;
							$('.wcgs-grid-template-slide.wcgs-hidden-item').each(function (index) {
								// Process every first item in each pair (i.e., every second index).
								if (index % $grid_column === 0) {
									var $first = $(this);
									var $second = $('.wcgs-grid-template-slide.wcgs-hidden-item').eq(index + 1);
									// Combine the heights of the pair.
									var combinedHeight = $first.outerHeight(true);
									if ($second.length > 0) {
										combinedHeight = $first.outerHeight(true) > $second.outerHeight(true) ? $first.outerHeight(true) : $second.outerHeight(true);
									}

									// Sum the height of the larger item.
									hiddenItemHeight += combinedHeight;
								}
							});
							$('html, body').animate({
								scrollTop: scroll_top
							}, hiddenItemHeight * speed);
							$('.wcgs-grid-template').animate({ height: totalHeight }, hiddenItemHeight * speed);
							$('.wcgs-grid-template-slide:not(.wcgs-shown-item)').addClass('wcgs-hidden-item');
							setTimeout(() => {
								$('.wcgs-grid-template-slide.wcgs-hidden-item').css('opacity', 0)
								$('html, body').animate({
									scrollTop: shown_item_top + totalHeight - lastItemHeight
								}, lastItemHeight * 0.5);
							}, hiddenItemHeight * speed);
							$(this).find('span').text(settings.expand_collapse.expand);
							$(this).find('.wgsp-icon').removeClass('sp-wgsp-icon-up-open-big').addClass('sp-wgsp-icon-down-open-big');
						}
					});
				}
			}
		}


		function grid_vertical_scroll() {
			if ('grid' == settings.gallery_layout && 'scroll' == settings.gallery_expansion) {
				var specificArea = $('.wcgs-grid-template.grid');
				var specificAreaOuterHeight = specificArea.outerHeight()
				specificArea.css({ 'height': specificAreaOuterHeight, 'overflow-y': 'auto' })
				$('.wcgs-grid-template-slide:not(.wcgs-shown-item)').removeClass('wcgs-hidden-item');
			}
		}
		grid_vertical_scroll();
		if ('grid' == settings.gallery_layout && $('.summary.entry-summary').length > 0 && $(window).width() > 771) {
			$('.summary.entry-summary').wrapInner("<div class='inner-wrapper-summary'></div>");
			var summaryWrapArea = $('.summary.entry-summary');
			var summaryAreaWidth = summaryWrapArea.outerWidth();
			setTimeout(() => {
				summaryAreaWidth = summaryWrapArea.outerWidth();
			}, 100);
			var summaryArea = $('.inner-wrapper-summary');
			var summaryAreaTop = summaryArea.offset().top;
			var summaryAreaLeft = summaryArea.offset().left;

			$(window).on('scroll', function () {
				var scrollPosition = $(window).scrollTop();
				var galleryAreaHeight = $('#wpgs-gallery').outerHeight();
				var galleryPositionTop = $('#wpgs-gallery').offset().top;
				var summaryAreaHeight = summaryArea.outerHeight();
				if (summaryAreaHeight < galleryAreaHeight) {
					if ((galleryPositionTop - scrollPosition) <= -20 && galleryPositionTop + (galleryAreaHeight - summaryAreaHeight) >= scrollPosition) {
						summaryArea.css({
							position: 'fixed',
							top: (galleryPositionTop - scrollPosition) <= -20 ? -20 : galleryPositionTop - scrollPosition,
							width: summaryAreaWidth
						});
					} else if (scrollPosition >= (galleryPositionTop + galleryAreaHeight - summaryAreaHeight) && scrollPosition < (galleryPositionTop + galleryAreaHeight)) {
						var gallery_position_height = galleryPositionTop + galleryAreaHeight;
						var gallery_position = scrollPosition + summaryAreaHeight - gallery_position_height;
						summaryArea.css({
							position: 'fixed',
							top: -20 - gallery_position,
							width: summaryAreaWidth
						});
					} else {
						summaryArea.css({
							position: 'static',
							top: 'auto',
							left: 'auto',
							width: summaryAreaWidth
						});
					}
				} else {
					summaryArea.css({
						position: 'static',
						top: 'auto',
						left: 'auto',
						width: summaryAreaWidth
					});
				}
			});
		}
	});
})(jQuery);
