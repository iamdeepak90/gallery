{assign var="th_size" value=$thumbnails_size|default:80}
{if !$preview_id}
    {$preview_id = $product.product_id}
{/if}

{if $product.image_pairs}

{style src="addons/core_files_changes/swiper-bundle.min.css"}
{style src="addons/core_files_changes/jquery.fancybox.min.css"}
{style src="addons/core_files_changes/gallery.min.css"}

<div id="wpgs-gallery" class="wcgs-woocommerce-product-gallery horizontal">
    <div class="gallery-navigation-carousel-wrapper horizontal">
        <div thumbsSlider="" class="gallery-navigation-carousel swiper horizontal hover">
            <div class="swiper-wrapper">

                {foreach $product.image_pairs as $image}
                <div class="wcgs-thumb swiper-slide">
                    {include file="common/image.tpl" images=$image image_width=$th_size image_height=$th_size show_detailed_link=false obj_id="`$preview_id`_`$img_id`_mini"}
                </div>
                {/foreach}

            </div>

            <div class="wcgs-swiper-button-next wcgs-swiper-arrow sp-wgsp-icon-right-open-3"></div>
            <div class="wcgs-swiper-button-prev wcgs-swiper-arrow sp-wgsp-icon-left-open-4"></div>
        </div>
        <div class="wcgs-border-bottom"></div>
    </div>

    <div class="wcgs-carousel center_center in_side horizontal  wcgs_xzoom_wrapper swiper">
        <div class="swiper-wrapper horizontal">

            {foreach $product.image_pairs as $image}
            <div class="swiper-slide">
                <div class="wcgs-slider-image">
                    <div class="wcgs-grid-lightbox">
                        <a class="wcgs-slider-lightbox" data-thumb="{$image.detailed.image_path}" data-fancybox="view" href="{$image.detailed.image_path}"></a>
                    </div>
                    <img class="wcgs-slider-image-tag xzoom" src="{$image.detailed.image_path}" xoriginal="{$image.detailed.image_path}" />
                </div>
            </div>
            {/foreach}

        </div>
        <div class="swiper-pagination bullets"></div>
    </div>

    <div class="zoomarea"></div>
</div>

{script src="js/addons/core_files_changes/jquery.fancybox.min.js"}
{script src="js/addons/core_files_changes/swiper-bundle.min.js"}

<style>
.zoomarea {
    width: 450px;
    height: 450px;
    overflow: hidden;
    position: absolute;
    left: -450px;
    top: 10%;
    border: 1px solid #e7d8c3;
    background-color: #fbf6ef;
    display: none;
    z-index: 1000;
    background-repeat: no-repeat;
    background-size: auto;
}
</style>

<script>
var wcgs_object = {
    wcgs_settings: {
        gallery_layout: "horizontal",
        thumbnails_item_to_show: "7",
        thumbnails_sliders_space: { width: "0", height: "0" },
        thumb_active_on: "click",
        slide_orientation: "horizontal",
        navigation: "0",
        zoomlevel: 3,
        thumbnailnavigation: "1",
        lightbox: "1",
        thumb_gallery_show: "1",
        gallery_fs_btn: "1",
        gallery_dl_btn: "1",
        enqueue_fancybox_css: "1",
        enqueue_fancybox_js: "1",
        enqueue_swiper_css: "1",
        enqueue_swiper_js: "1",
    }
};
</script>

{script src="js/addons/core_files_changes/gallery.js"}
{/if}

{hook name="products:product_images"}{/hook}