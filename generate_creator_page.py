import re
import os

def get_youtube_embed_url(url):
    """Extract YouTube video ID from a URL and return the embed URL."""
    video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if video_id_match:
        return f"https://www.youtube.com/embed/{video_id_match.group(1)}"
    return url  # Return as-is if no match (assumes user provided embed URL directly)

def generate_creator_html():
    # Collect user inputs
    creator_name = input("Creator Name: ").strip().upper()  # Convert to uppercase for consistency
    bio_para1 = input("Bio Paragraph 1: ").strip()
    bio_para2 = input("Bio Paragraph 2: ").strip()
    reach = input("Reach (e.g., 253k): ").strip()
    monthly_viewership = input("Monthly Viewership (e.g., 98k): ").strip()
    viral_moment_title = input("Viral Moment Video Title: ").strip()
    viral_moment_url = input("Viral Moment YouTube URL: ").strip()
    viral_moment_views = input("Viral Moment Views (e.g., 956k): ").strip()
    fanbase_style = input("Fanbase Style (e.g., Hyper-loyal, interactive): ").strip()
    main_video_url = input("Main Video YouTube URL: ").strip()
    main_video_title = input("Main Video Title: ").strip()
    featured_image = input("Featured Image Filename (e.g., creator-image.jpg): ").strip()
    
    # Social media links (optional)
    facebook_url = input("Facebook URL (leave blank if none): ").strip() or "https://www.facebook.com"
    instagram_url = input("Instagram URL (leave blank if none): ").strip() or "https://www.instagram.com"
    youtube_url = input("YouTube URL (leave blank if none): ").strip() or f"https://www.youtube.com/@{creator_name.lower()}"
    tiktok_url = input("TikTok URL (leave blank if none): ").strip() or f"https://www.tiktok.com/@{creator_name.lower()}"

    # Process YouTube URLs
    main_video_embed_url = get_youtube_embed_url(main_video_url)
    viral_moment_embed_url = get_youtube_embed_url(viral_moment_url)

    # HTML template with placeholders
    html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title> TrueConext | {creator_name} </title>
<!-- Stylesheets -->
<link href="assets/css/bootstrap.css" rel="stylesheet">
<link href="assets/css/style.css" rel="stylesheet">
<link href="assets/css/responsive.css" rel="stylesheet">

<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,600;1,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

<link rel="shortcut icon" href="assets/images/favicon.png" type="image/x-icon">
<link rel="icon" href="assets/images/favicon.png" type="image/x-icon">

<!-- Responsive -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
</head>

<body>
<div class="page-wrapper image-layer" style="background-image:url(assets/images/background/4.jpg)">	
	<!-- Main Header -->
	<header class="main-header">
		<!-- Header Lower -->
		<div class="header-lower">
			<div class="auto-container">
				<div class="inner-container">
					<div class="d-flex justify-content-between align-items-center flex-wrap">
						<div class="logo-box">
							<div class="logo"><a href="index.html"><img src="assets/images/logo.png" alt="" title=""></a></div>
						</div>
						<div class="nav-outer d-flex flex-wrap">
							<!-- Main Menu -->
							<nav class="main-menu navbar-expand-md">
								<div class="navbar-header">
									<!-- Toggle Button -->    	
									<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
										<span class="icon-bar"></span>
										<span class="icon-bar"></span>
										<span class="icon-bar"></span>
									</button>
								</div>
								<div class="navbar-collapse collapse clearfix" id="navbarSupportedContent">
									<ul class="navigation clearfix">
										<li><a href="index.html">Home</a></li>
										<li><a href="about.html">About</a></li>
										<li><a href="Creators.html">Creators</a>
											<ul>
												<li><a href="work.html">work</a></li>
												<li><a href="single-work.html">work detail</a></li>
											</ul>
										</li>
										<li><a href="contact.html">Contact</a></li>
									</ul>
								</div>
							</nav>
						</div>
						<!-- Mobile Navigation Toggler -->
						<div class="mobile-nav-toggler">
							<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-menu-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!--End Header Lower-->
		<!-- Mobile Menu  -->
		<div class="mobile-menu">
			<div class="menu-backdrop"></div>
			<div class="close-btn"><span class="icon fa-solid fa-xmark fa-fw"></span></div>
			<nav class="menu-box">
				<div class="nav-logo"><a href="index.html"><img src="assets/images/mobile-logo.png" alt="" title=""></a></div>
				<div class="menu-outer"></div>
			</nav>
		</div>
		<!-- End Mobile Menu -->
	</header>
	<!-- End Main Header -->
	
	<!-- Single Work -->
	<section class="single-work">
		<div class="auto-container">
			<div class="row clearfix">
				<!-- Column -->
				<div class="column col-lg-6 col-md-12 col-sm-12">
					<div class="single-work_image">
						<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; margin-bottom: 24px;">
							<iframe src="{main_video_embed_url}"
								title="{main_video_title}"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerpolicy="strict-origin-when-cross-origin"
								allowfullscreen
								style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
						</div>
					</div>
					<div class="single-work_image">
						<img src="assets/images/resource/{featured_image}" alt="{creator_name}" />
					</div>
				</div>
				<!-- Column -->
				<div class="column col-lg-6 col-md-12 col-sm-12">
					<div style="display: flex; align-items: center;">
						<h2 class="single-work_title" style="margin-bottom:0; color: #10FF92;">
							{creator_name}
						</h2>
						<ul class="single-work_socials" style="display: flex; list-style: none; margin-left: 15px; padding: 0; font-size: 14px;">
							<li style="margin-right: 10px;">
								<a href="{facebook_url}" target="_blank" rel="noopener">X <i class="fa-solid fa-arrow-right fa-fw"></i></a>
							</li>
							<li style="margin-right: 10px;">
								<a href="{instagram_url}" target="_blank" rel="noopener">Instagram <i class="fa-solid fa-arrow-right fa-fw"></i></a>
							</li>
							<li style="margin-right: 10px;">
								<a href="{youtube_url}" target="_blank" rel="noopener">YouTube <i class="fa-solid fa-arrow-right fa-fw"></i></a>
							</li>
							<li>
								<a href="{tiktok_url}" target="_blank" rel="noopener">TikTok <i class="fa-solid fa-arrow-right fa-fw"></i></a>
							</li>
						</ul>
					</div>
					<p>{bio_para1}</p>
					<p>{bio_para2}</p>
					<ul class="single-work_list">
						<li>
							REACH
							<span>{reach}</span>
						</li>
						<li>
							Monthly Viewership
							<span>{monthly_viewership}</span>
						</li>
						<li>
							Viral Moment
							<a href="{viral_moment_embed_url}" target="_blank" rel="noopener"><span style="color: #7c3aed;">{viral_moment_title}</span></a><span> {viral_moment_views}</span>
						</li>					
						<li>
							Fanbase Style
							<span>{fanbase_style}</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
	<!-- End Single Work -->
	
	<!-- Main Footer -->
	<footer class="main-footer">
		<div class="auto-container">
			<!-- Widgets Section -->
			<div class="widgets-section">
				<div class="row clearfix">
					<!-- Footer Column -->
					<div class="footer-column col-lg-8 col-md-12 col-sm-12">
						<div class="footer-text">We build honest connections <br> between brands and creators. <br> No shortcuts. No empty promises.</div>
						<h2>Interested in working with us? <a href="mailto:admin@trueconext.com">admin@trueconext.com</a></h2>
						<ul class="footer_socials">
							<li><a href="https://www.facebook.com/profile.php?id=61577477713327" target="_blank" rel="noopener">Facebook <i class="fa-solid fa-arrow-right fa-fw"></i></a></li>
							<li><a href="https://www.instagram.com/trueconext" target="_blank" rel="noopener">Instagram <i class="fa-solid fa-arrow-right fa-fw"></i></a></li>
							<li><a href="https://x.com/TrueConext" target="_blank" rel="noopener">X <i class="fa-solid fa-arrow-right fa-fw"></i></a></li>
						</ul>
					</div>
					<!-- Footer Column -->
					<div class="footer-column col-lg-4 col-md-12 col-sm-12">
						<ul class="footer_navs">
							<li><a href="index.html">Home <i class="fa-solid fa-arrow-right fa-fw"></i></a></li>
							<li><a href="about.html">About <i class="fa-solid fa-arrow-right fa-fw"></i></a></li>
							<li><a href="Creators.html">Creators <i class="fa-solid fa-arrow-right fa-fw"></i></a></li>
							<li><a href="contact.html">Contact <i class="fa-solid fa-arrow-right fa-fw"></i></a></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div class="footer-bottom">
			<div class="auto-container">
				<div class="d-flex justify-content-between align-items-center flex-wrap">
					<div class="footer_copyright">© 2025 Trueconext  - All Rights Reserved</div>
					<a class="backtop down-box scroll-to-target" data-target=".page-wrapper">
						<i class="fa-solid fa-arrow-up"></i>
					</a>
				</div>
			</div>
		</div>
	</footer>
	<!-- End Main Footer -->
</div>
<!-- End PageWrapper -->
<script src="assets/js/jquery.js"></script>
<script src="assets/js/popper.min.js"></script>
<script src="assets/js/bootstrap.min.js"></script>
<script src="assets/js/appear.js"></script>
<script src="assets/js/wow.js"></script>
<script src="assets/js/swiper.min.js"></script>
<script src="assets/js/odometer.js"></script>
<script src="assets/js/gsap.min.js"></script>
<script src="assets/js/SplitText.min.js"></script>
<script src="assets/js/ScrollTrigger.min.js"></script>
<script src="assets/js/ScrollToPlugin.min.js"></script>
<script src="assets/js/ScrollSmoother.min.js"></script>
<script src="assets/js/script.js"></script>
<!--[if lt IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script><![endif]-->
<!--[if lt IE 9]><script src="js/respond.js"></script><![endif]-->
</body>
</html>
"""

    # Format the template with user inputs
    html_content = html_template.format(
        creator_name=creator_name,
        bio_para1=bio_para1,
        bio_para2=bio_para2,
        reach=reach,
        monthly_viewership=monthly_viewership,
        viral_moment_title=viral_moment_title,
        viral_moment_embed_url=viral_moment_embed_url,
        viral_moment_views=viral_moment_views,
        fanbase_style=fanbase_style,
        main_video_embed_url=main_video_embed_url,
        main_video_title=main_video_title,
        featured_image=featured_image,
        facebook_url=facebook_url,
        instagram_url=instagram_url,
        youtube_url=youtube_url,
        tiktok_url=tiktok_url
    )

    # Generate output filename
    output_filename = f"{creator_name.lower().replace(' ', '-')}-profile.html"
    
    # Save the HTML file
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"HTML file generated: {output_filename}")

if __name__ == "__main__":
    generate_creator_html()