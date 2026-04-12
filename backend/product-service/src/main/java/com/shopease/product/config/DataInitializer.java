package com.shopease.product.config;

import com.shopease.product.entity.Category;
import com.shopease.product.entity.Product;
import com.shopease.product.repository.CategoryRepository;
import com.shopease.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 10) return;

        log.info("Seeding categories and products...");

        Category electronics = cat("Electronics", "electronics");
        Category clothing    = cat("Clothing",    "clothing");
        Category grocery     = cat("Grocery",     "grocery");
        Category home        = cat("Home & Garden","home-garden");
        Category sports      = cat("Sports",      "sports");
        Category toys        = cat("Toys",        "toys");
        Category beauty      = cat("Beauty",      "beauty");
        Category auto        = cat("Auto",        "auto");

        List<Product> products = new ArrayList<>();

        // ── ELECTRONICS (50 products) ─────────────────────────────────────────
        String[] tvBrands  = {"Samsung","LG","Sony","TCL","Hisense","Vizio","Philips"};
        String[] tvSizes   = {"43\"","50\"","55\"","65\"","75\"","85\""};
        String[] tvTypes   = {"4K Smart TV","OLED TV","QLED TV","LED TV","NanoCell TV"};
        for (int i = 0; i < 12; i++) {
            String brand = tvBrands[i % tvBrands.length];
            String size  = tvSizes[i % tvSizes.length];
            String type  = tvTypes[i % tvTypes.length];
            double price = 250 + (i * 55);
            products.add(Product.builder()
                .sku("ELEC-TV-" + (i+1))
                .name(brand + " " + size + " " + type)
                .description("Crystal clear display with smart streaming features, HDR support, and built-in voice assistant.")
                .price(price).originalPrice(price * 1.25)
                .category(electronics).brand(brand)
                .images("https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&q=80")
                .rating(3.8 + (i % 12) * 0.1).reviewCount(50 + i * 20)
                .inStock(true).stockQuantity(10 + i)
                .tags("tv,electronics," + brand.toLowerCase() + ",smart-tv").build());
        }

        String[] phoneBrands = {"Apple","Samsung","Google","OnePlus","Motorola","Nokia"};
        String[] phoneModels = {"Pro Max","Ultra","Plus","Standard","Lite","Mini"};
        for (int i = 0; i < 10; i++) {
            String brand = phoneBrands[i % phoneBrands.length];
            String model = phoneModels[i % phoneModels.length];
            double price = 399 + i * 60;
            products.add(Product.builder()
                .sku("ELEC-PHN-" + (i+1))
                .name(brand + " Smartphone " + model)
                .description("Latest " + brand + " smartphone with 5G, triple camera system, and all-day battery life.")
                .price(price).originalPrice(price * 1.15)
                .category(electronics).brand(brand)
                .images("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80")
                .rating(4.0 + (i % 8) * 0.1).reviewCount(100 + i * 30)
                .inStock(true).stockQuantity(30 + i * 2)
                .tags("phone,smartphone," + brand.toLowerCase() + ",5g").build());
        }

        String[] laptopBrands = {"Apple","Dell","HP","Lenovo","Asus","Acer","Microsoft"};
        for (int i = 0; i < 10; i++) {
            String brand = laptopBrands[i % laptopBrands.length];
            double price = 699 + i * 100;
            products.add(Product.builder()
                .sku("ELEC-LPT-" + (i+1))
                .name(brand + " Laptop " + (14 + i % 3) + "\" " + (i % 2 == 0 ? "Core i7" : "Ryzen 7"))
                .description("High-performance laptop for work and entertainment. Fast SSD, 16GB RAM, long battery life.")
                .price(price).originalPrice(price * 1.2)
                .category(electronics).brand(brand)
                .images("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80")
                .rating(4.2 + (i % 6) * 0.1).reviewCount(80 + i * 15)
                .inStock(true).stockQuantity(15 + i)
                .tags("laptop,computer," + brand.toLowerCase() + ",portable").build());
        }

        String[] headBrands = {"Sony","Bose","Apple","JBL","Sennheiser","Beats"};
        for (int i = 0; i < 8; i++) {
            String brand = headBrands[i % headBrands.length];
            double price = 79 + i * 40;
            products.add(Product.builder()
                .sku("ELEC-AUD-" + (i+1))
                .name(brand + " " + (i % 2 == 0 ? "Over-Ear Headphones" : "True Wireless Earbuds"))
                .description("Premium audio with active noise cancellation, 30-hour battery, and crystal-clear sound.")
                .price(price).originalPrice(price * 1.3)
                .category(electronics).brand(brand)
                .images("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80")
                .rating(4.3 + (i % 5) * 0.1).reviewCount(200 + i * 25)
                .inStock(true).stockQuantity(40 + i * 3)
                .tags("headphones,audio," + brand.toLowerCase() + ",wireless").build());
        }

        // Cameras, tablets, smartwatches
        String[][] extras = {
            {"ELEC-CAM-1","Sony Alpha A7 IV Mirrorless Camera","Professional full-frame mirrorless camera with 33MP sensor","2498.00","2799.00","Sony","camera,mirrorless,photography,sony","https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80"},
            {"ELEC-CAM-2","Canon EOS R10 Mirrorless Camera","Lightweight mirrorless with 24.2MP APS-C sensor","979.00","1099.00","Canon","camera,canon,mirrorless,photography","https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80"},
            {"ELEC-TAB-1","Apple iPad Pro 12.9\" M2","Most powerful iPad with Liquid Retina XDR display","1099.00","1199.00","Apple","ipad,tablet,apple,m2","https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80"},
            {"ELEC-TAB-2","Samsung Galaxy Tab S9+","Android tablet with 12.4\" AMOLED display","999.00","1099.00","Samsung","tablet,samsung,android,amoled","https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400&q=80"},
            {"ELEC-WCH-1","Apple Watch Series 9","Advanced health monitoring smartwatch with always-on display","399.00","429.00","Apple","smartwatch,apple,fitness,health","https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80"},
            {"ELEC-WCH-2","Samsung Galaxy Watch 6 Classic","Premium smartwatch with rotating bezel and health tracking","349.00","399.00","Samsung","smartwatch,samsung,galaxy,fitness","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"},
            {"ELEC-GAM-1","PlayStation 5 Console","Next-gen gaming console with 4K gaming and ultra-fast SSD","499.00","499.00","Sony","ps5,gaming,console,sony","https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80"},
            {"ELEC-GAM-2","Xbox Series X","4K gaming at 60fps, backward compatible, Game Pass ready","499.00","499.00","Microsoft","xbox,gaming,console,microsoft","https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80"},
            {"ELEC-GAM-3","Nintendo Switch OLED","Portable gaming with vibrant 7\" OLED screen","349.00","349.00","Nintendo","switch,gaming,nintendo,portable","https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&q=80"},
            {"ELEC-SPK-1","Sonos Era 300 Speaker","Spatial audio speaker with Dolby Atmos support","449.00","499.00","Sonos","speaker,sonos,audio,spatial","https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80"},
        };
        for (String[] e : extras) {
            products.add(Product.builder()
                .sku(e[0]).name(e[1]).description(e[2])
                .price(Double.parseDouble(e[3])).originalPrice(Double.parseDouble(e[4]))
                .category(electronics).brand(e[5].split(",")[0].isEmpty() ? "Generic" : "")
                .brand(e[1].contains("Apple") ? "Apple" : e[1].contains("Samsung") ? "Samsung" : e[1].contains("Sony") ? "Sony" : e[1].contains("Microsoft") ? "Microsoft" : e[1].contains("Nintendo") ? "Nintendo" : e[1].contains("Sonos") ? "Sonos" : e[1].contains("Canon") ? "Canon" : "Generic")
                .images(e[6]).rating(4.5).reviewCount(300)
                .inStock(true).stockQuantity(20).tags(e[5]).build());
        }

        // ── CLOTHING (50 products) ────────────────────────────────────────────
        String[] menItems = {
            "Classic Oxford Shirt","Slim Fit Chinos","Wool Blend Blazer","Cargo Pants",
            "Graphic Tee","Polo Shirt","Formal Dress Shirt","Hooded Sweatshirt",
            "Athletic Shorts","Fleece Joggers","Crew Neck Sweater","Bomber Jacket",
            "Linen Shirt","Corduroy Pants","Puffer Vest"
        };
        String[] menBrands = {"Calvin Klein","Ralph Lauren","Tommy Hilfiger","Gap","H&M","Zara","Uniqlo","Levi's"};
        String[] menImages = {
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80",
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
            "https://images.unsplash.com/photo-1594938298603-c8148c4b6f07?w=400&q=80",
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
        };
        for (int i = 0; i < 15; i++) {
            String brand = menBrands[i % menBrands.length];
            double price = 24.99 + i * 8;
            products.add(Product.builder()
                .sku("CLTH-MEN-" + (i+1))
                .name("Men's " + menItems[i])
                .description("Premium quality men's " + menItems[i].toLowerCase() + " made with breathable, durable fabric. Perfect for everyday wear.")
                .price(price).originalPrice(price * 1.35)
                .category(clothing).brand(brand)
                .images(menImages[i % menImages.length])
                .rating(4.0 + (i % 8) * 0.1).reviewCount(40 + i * 10)
                .inStock(true).stockQuantity(50 + i * 3)
                .tags("men,clothing," + menItems[i].toLowerCase().replace(" ", "-")).build());
        }

        String[] womenItems = {
            "Floral Midi Dress","High-Waist Jeans","Cashmere Sweater","Wrap Blouse",
            "Pleated Skirt","Trench Coat","Yoga Leggings","Linen Blazer",
            "Summer Romper","Off-Shoulder Top","Wide-Leg Pants","Denim Jacket",
            "Bodycon Dress","Knit Cardigan","Satin Slip Dress"
        };
        String[] womenBrands = {"Anthropologie","Free People","Madewell","Reformation","Zara","H&M","ASOS","Nordstrom"};
        String[] womenImages = {
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80",
            "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80",
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
        };
        for (int i = 0; i < 15; i++) {
            String brand = womenBrands[i % womenBrands.length];
            double price = 29.99 + i * 9;
            products.add(Product.builder()
                .sku("CLTH-WMN-" + (i+1))
                .name("Women's " + womenItems[i])
                .description("Stylish women's " + womenItems[i].toLowerCase() + " for every occasion. Comfortable, fashionable, and versatile.")
                .price(price).originalPrice(price * 1.4)
                .category(clothing).brand(brand)
                .images(womenImages[i % womenImages.length])
                .rating(4.1 + (i % 7) * 0.1).reviewCount(55 + i * 12)
                .inStock(true).stockQuantity(45 + i * 2)
                .tags("women,clothing," + womenItems[i].toLowerCase().replace(" ", "-")).build());
        }

        String[] shoeItems = {"Running Sneakers","Leather Oxford Shoes","High-Top Basketball Shoes",
            "Slip-On Loafers","Chelsea Boots","Hiking Boots","Sandals","Flip Flops",
            "Platform Heels","Ankle Boots","Training Shoes","Casual Canvas Shoes"};
        String[] shoeBrands = {"Nike","Adidas","New Balance","Vans","Converse","Timberland","Dr. Martens","Puma"};
        for (int i = 0; i < 12; i++) {
            String brand = shoeBrands[i % shoeBrands.length];
            double price = 49.99 + i * 15;
            products.add(Product.builder()
                .sku("CLTH-SHO-" + (i+1))
                .name(brand + " " + shoeItems[i])
                .description("Premium " + shoeItems[i].toLowerCase() + " with superior comfort, durability, and style for all-day wear.")
                .price(price).originalPrice(price * 1.25)
                .category(clothing).brand(brand)
                .images("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80")
                .rating(4.2 + (i % 6) * 0.1).reviewCount(80 + i * 20)
                .inStock(true).stockQuantity(35 + i * 2)
                .tags("shoes,footwear," + brand.toLowerCase() + "," + shoeItems[i].toLowerCase().replace(" ", "-")).build());
        }

        // Accessories
        String[] accItems = {"Leather Belt","Wool Scarf","Baseball Cap","Beanie Hat","Sunglasses","Leather Wallet","Canvas Backpack","Crossbody Bag"};
        for (int i = 0; i < 8; i++) {
            double price = 19.99 + i * 12;
            products.add(Product.builder()
                .sku("CLTH-ACC-" + (i+1))
                .name(accItems[i])
                .description("High-quality " + accItems[i].toLowerCase() + " that completes any outfit. Durable and stylish.")
                .price(price).originalPrice(price * 1.3)
                .category(clothing).brand("Fashion Co.")
                .images("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80")
                .rating(4.0 + (i % 5) * 0.1).reviewCount(30 + i * 8)
                .inStock(true).stockQuantity(60 + i * 5)
                .tags("accessories,fashion," + accItems[i].toLowerCase().replace(" ", "-")).build());
        }

        // ── GROCERY (50 products) ─────────────────────────────────────────────
        String[][] groceryItems = {
            {"GROC-DRY-1","Organic Brown Rice (5 lb)","Whole grain organic brown rice, non-GMO","6.99","0","Rice Brand","rice,grains,organic,pantry","https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80"},
            {"GROC-DRY-2","Quaker Old Fashioned Oats (42 oz)","Heart-healthy whole grain oats","5.49","0","Quaker","oats,breakfast,cereal,healthy","https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80"},
            {"GROC-DRY-3","Barilla Pasta Variety Pack (6-pack)","6 assorted pasta shapes, premium durum wheat","12.99","0","Barilla","pasta,italian,barilla,pantry","https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&q=80"},
            {"GROC-DRY-4","Campbell's Chicken Noodle Soup (12-pack)","Classic comfort soup, ready to serve","18.99","21.99","Campbell's","soup,canned,chicken,pantry","https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80"},
            {"GROC-DRY-5","Heinz Ketchup (64 oz)","America's favorite ketchup, family size","7.99","9.49","Heinz","ketchup,condiment,heinz","https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&q=80"},
            {"GROC-BEV-1","Tropicana Pure Premium OJ (52 oz)","100% pure squeezed orange juice, no pulp","6.49","7.49","Tropicana","juice,orange,tropicana,beverage","https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80"},
            {"GROC-BEV-2","Coca-Cola Classic (12-pack cans)","The original taste of Coca-Cola","9.99","11.99","Coca-Cola","soda,coke,beverage,coca-cola","https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80"},
            {"GROC-BEV-3","Starbucks Cold Brew Coffee (11oz, 4-pack)","Ready-to-drink cold brew coffee","16.99","19.99","Starbucks","coffee,cold-brew,starbucks,beverage","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"},
            {"GROC-BEV-4","Deer Park Spring Water (40-pack)","Pure natural spring water, 16.9 oz bottles","14.99","16.99","Deer Park","water,spring,bottled,hydration","https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80"},
            {"GROC-DAI-1","Organic Whole Milk (1 Gallon)","Fresh organic whole milk from local farms","5.99","0","Organic Valley","milk,organic,dairy","https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80"},
            {"GROC-DAI-2","Tillamook Sharp Cheddar (2 lb block)","Award-winning aged sharp cheddar cheese","11.99","13.99","Tillamook","cheese,cheddar,tillamook,dairy","https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80"},
            {"GROC-DAI-3","Chobani Greek Yogurt (32 oz)","Plain nonfat Greek yogurt, high protein","6.99","7.99","Chobani","yogurt,greek,chobani,dairy","https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80"},
            {"GROC-DAI-4","Land O Lakes Unsalted Butter (4 sticks)","Premium quality unsalted butter","6.49","7.49","Land O Lakes","butter,dairy,baking","https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80"},
            {"GROC-DAI-5","Dozen Large Eggs (Free Range)","Cage-free large brown eggs, farm fresh","5.99","0","Happy Egg Co.","eggs,dairy,free-range,breakfast","https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?w=400&q=80"},
            {"GROC-PRO-1","Tyson Boneless Chicken Breasts (3 lb)","All-natural boneless skinless chicken breasts","11.99","13.99","Tyson","chicken,meat,protein,tyson","https://images.unsplash.com/photo-1604503468506-a8da13d11bdc?w=400&q=80"},
            {"GROC-PRO-2","Atlantic Salmon Fillet (2 lb)","Fresh Atlantic salmon, rich in Omega-3","19.99","24.99","SeaBest","salmon,fish,seafood,protein","https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80"},
            {"GROC-PRO-3","Oscar Mayer Turkey Breast Deli Meat (16 oz)","Lean oven-roasted turkey breast slices","7.49","8.49","Oscar Mayer","turkey,deli,protein,lunch","https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&q=80"},
            {"GROC-FRT-1","Organic Strawberries (2 lb)","Sweet ripe organic strawberries, locally grown","6.99","0","Local Farms","strawberries,fruit,organic,fresh","https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80"},
            {"GROC-FRT-2","Fresh Blueberries (18 oz)","Plump, sweet wild blueberries packed with antioxidants","5.99","6.99","Driscoll's","blueberries,fruit,fresh,antioxidants","https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80"},
            {"GROC-FRT-3","Organic Bananas (3 lb bunch)","Ripe organic bananas, naturally sweet","2.99","0","Dole","bananas,fruit,organic,dole","https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80"},
            {"GROC-VEG-1","Baby Spinach (5 oz)","Tender pre-washed organic baby spinach leaves","3.99","4.99","Earthbound Farm","spinach,greens,organic,salad","https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80"},
            {"GROC-VEG-2","Organic Cherry Tomatoes (1 pint)","Bursting with flavor organic cherry tomatoes","3.49","4.49","Local Farms","tomatoes,cherry,organic,vegetable","https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80"},
            {"GROC-VEG-3","Broccoli Crowns (2 lb)","Fresh green broccoli crowns, crisp and nutritious","3.99","0","Local Farms","broccoli,vegetable,fresh,healthy","https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80"},
            {"GROC-SNK-1","Lay's Classic Potato Chips (8 oz)","America's favorite potato chips, perfectly salted","4.29","4.99","Lay's","chips,snacks,lays,potato","https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80"},
            {"GROC-SNK-2","Oreo Original Cookies (39 oz)","Classic chocolate sandwich cookies with creme filling","8.99","10.99","Nabisco","oreos,cookies,snacks,nabisco","https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80"},
            {"GROC-SNK-3","Kind Dark Chocolate Nuts & Sea Salt Bars (12-pack)","Wholesome snack bars with whole nuts","21.99","24.99","Kind","bars,healthy,nuts,dark-chocolate","https://images.unsplash.com/photo-1499195333224-3ce974eecb47?w=400&q=80"},
        };
        for (String[] g : groceryItems) {
            double op = g[4].equals("0") ? 0 : Double.parseDouble(g[4]);
            products.add(Product.builder()
                .sku(g[0]).name(g[1]).description(g[2])
                .price(Double.parseDouble(g[3])).originalPrice(op > 0 ? op : null)
                .category(grocery).brand(g[5])
                .images(g[7]).rating(4.3 + Math.random() * 0.5).reviewCount((int)(50 + Math.random() * 400))
                .inStock(true).stockQuantity((int)(20 + Math.random() * 200))
                .tags(g[6]).build());
        }

        // ── HOME & GARDEN (30 products) ───────────────────────────────────────
        String[][] homeItems = {
            {"HOME-KIT-1","KitchenAid Artisan Stand Mixer 5-Qt","Professional 5-quart stand mixer with 10 speeds and 59 attachments","379.99","449.99","KitchenAid","mixer,kitchen,baking,kitchenaid","https://images.unsplash.com/photo-1565515636669-8a5e83d32e56?w=400&q=80"},
            {"HOME-KIT-2","Instant Pot Duo 7-in-1 (6 Qt)","Multi-cooker: pressure cooker, slow cooker, rice cooker, and more","79.99","99.99","Instant Pot","instant-pot,cooking,pressure-cooker","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"},
            {"HOME-KIT-3","Cuisinart 12-Cup Coffee Maker","Programmable coffee maker with built-in grinder and thermal carafe","149.99","179.99","Cuisinart","coffee,maker,cuisinart,kitchen","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80"},
            {"HOME-KIT-4","Ninja Professional Blender 1000W","High-speed blender for smoothies, soups, and more","79.99","99.99","Ninja","blender,ninja,smoothie,kitchen","https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80"},
            {"HOME-KIT-5","Lodge 12-inch Cast Iron Skillet","Pre-seasoned cast iron skillet for stovetop and oven","39.99","49.99","Lodge","cast-iron,skillet,cooking,lodge","https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400&q=80"},
            {"HOME-KIT-6","Vitamix 5200 Blender Professional","Professional-grade blender with variable speed control","449.95","549.95","Vitamix","vitamix,blender,professional,kitchen","https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80"},
            {"HOME-BED-1","Beckham Hotel Collection Bed Pillows (2-pack)","Luxury gel pillow for ultimate comfort, queen size","39.99","49.99","Beckham","pillow,bedding,sleep,comfort","https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80"},
            {"HOME-BED-2","Egyptian Cotton Sheet Set (Queen)","1000 thread count Egyptian cotton, ultra-soft","89.99","119.99","Pinzon","sheets,bedding,cotton,queen","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80"},
            {"HOME-BED-3","Weighted Blanket 15 lb (60x80)","Therapeutic weighted blanket for better sleep","79.99","99.99","YnM","blanket,weighted,sleep,therapy","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"},
            {"HOME-DEC-1","LEVOIT Air Purifier for Bedroom","True HEPA air purifier, covers 1095 sq ft","89.99","109.99","LEVOIT","air-purifier,levoit,home,health","https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80"},
            {"HOME-DEC-2","Dyson V15 Detect Cordless Vacuum","Powerful cordless vacuum with laser dust detection","699.99","749.99","Dyson","vacuum,dyson,cordless,cleaning","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"HOME-DEC-3","iRobot Roomba i7+ Robot Vacuum","Self-emptying robot vacuum with smart mapping","599.99","699.99","iRobot","roomba,robot-vacuum,irobot,cleaning","https://images.unsplash.com/photo-1558618047-f4e75b0a6e22?w=400&q=80"},
            {"HOME-DEC-4","Philips Hue Smart Bulb Starter Kit","Color-changing smart LED bulbs, works with Alexa","179.99","199.99","Philips","smart-bulb,hue,philips,smart-home","https://images.unsplash.com/photo-1586374579358-9d19d632b6df?w=400&q=80"},
            {"HOME-DEC-5","Ember Temperature Control Smart Mug","Keep your coffee at the perfect temperature for hours","129.99","149.99","Ember","mug,smart,coffee,ember","https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80"},
            {"HOME-GRD-1","Fiskars Steel D-handle Spade","Durable steel garden spade with ergonomic D-handle","39.99","49.99","Fiskars","garden,spade,fiskars,tools","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"},
            {"HOME-GRD-2","MiracleGro All-Purpose Plant Food (8 lb)","Water-soluble plant food feeds plants instantly","22.99","27.99","MiracleGro","fertilizer,garden,plants,miracle-gro","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"},
            {"HOME-GRD-3","Sun Joe Electric Pressure Washer 2030 PSI","Powerful electric pressure washer for outdoor cleaning","189.99","219.99","Sun Joe","pressure-washer,cleaning,outdoor,garden","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"HOME-FUR-1","SONGMICS 3-Tier Bamboo Shelf","Natural bamboo bookshelf for home and office","49.99","64.99","SONGMICS","shelf,bamboo,storage,furniture","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"},
            {"HOME-FUR-2","Threshold Accent Chair","Mid-century modern design accent chair with wooden legs","289.99","349.99","Threshold","chair,furniture,modern,accent","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"},
            {"HOME-FUR-3","VASAGLE Industrial Ladder Shelf","5-Tier leaning ladder shelf for living room","69.99","89.99","VASAGLE","shelf,ladder,industrial,storage","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"},
        };
        for (String[] h : homeItems) {
            products.add(Product.builder()
                .sku(h[0]).name(h[1]).description(h[2])
                .price(Double.parseDouble(h[3])).originalPrice(Double.parseDouble(h[4]))
                .category(home).brand(h[5])
                .images(h[7]).rating(4.3 + Math.random() * 0.5).reviewCount((int)(30 + Math.random() * 500))
                .inStock(true).stockQuantity((int)(5 + Math.random() * 50))
                .tags(h[6]).build());
        }

        // ── SPORTS (30 products) ──────────────────────────────────────────────
        String[][] sportsItems = {
            {"SPRT-FIT-1","Bowflex SelectTech 552 Dumbbells (Pair)","Adjustable dumbbells replace 15 sets of weights","399.99","549.99","Bowflex","dumbbells,weights,fitness,bowflex","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"},
            {"SPRT-FIT-2","Peloton Bike+ Smart Exercise Bike","Premium indoor cycling with live classes","2495.00","2845.00","Peloton","bike,cycling,peloton,fitness","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80"},
            {"SPRT-FIT-3","TRX Home2 Suspension Trainer System","Full-body workout with suspension training","149.95","199.95","TRX","trx,suspension,training,gym","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"},
            {"SPRT-FIT-4","Yoga Mat Non-Slip (72x24, 6mm thick)","Premium TPE yoga mat with alignment lines","39.99","49.99","Manduka","yoga,mat,fitness,meditation","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80"},
            {"SPRT-FIT-5","Resistance Bands Set (5 bands)","Heavy-duty latex resistance bands for full body workout","24.99","34.99","Fit Simplify","resistance,bands,workout,gym","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"},
            {"SPRT-OUT-1","Coleman Sundome 4-Person Camping Tent","Weather-resistant tent with easy setup","79.99","99.99","Coleman","tent,camping,outdoor,coleman","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80"},
            {"SPRT-OUT-2","Osprey Atmos AG 65 Backpack","Anti-gravity suspension backpacking pack","290.00","340.00","Osprey","backpack,hiking,osprey,camping","https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80"},
            {"SPRT-OUT-3","YETI Tundra 45 Hard Cooler","Premium cooler with up to 5-day ice retention","325.00","399.00","YETI","cooler,yeti,outdoor,camping","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80"},
            {"SPRT-CYC-1","Trek FX 3 Disc Hybrid Bike","Versatile flat-bar road bike for commuting and fitness","1149.99","1299.99","Trek","bike,cycling,trek,hybrid","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"SPRT-CYC-2","Giro Radix MIPS Bike Helmet","MIPS safety technology cycling helmet","89.99","109.99","Giro","helmet,cycling,safety,giro","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"SPRT-BLL-1","Wilson NBA Official Game Basketball","Official NBA size basketball for indoor/outdoor play","39.99","49.99","Wilson","basketball,nba,wilson,sports","https://images.unsplash.com/photo-1546519638405-a9d1273cd8b7?w=400&q=80"},
            {"SPRT-BLL-2","Nike Mercurial Vapor Soccer Cleats","Lightweight soccer cleats for maximum speed","149.99","179.99","Nike","soccer,cleats,nike,football","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"},
            {"SPRT-BLL-3","Rawlings Official League Baseballs (3-pack)","Official size baseballs for practice and games","19.99","24.99","Rawlings","baseball,rawlings,sports,ball","https://images.unsplash.com/photo-1546519638405-a9d1273cd8b7?w=400&q=80"},
            {"SPRT-SWM-1","Speedo Vanquisher 2.0 Swim Goggles","Anti-fog competition swim goggles","29.99","34.99","Speedo","goggles,swimming,speedo,aquatic","https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80"},
            {"SPRT-RUN-1","Garmin Forerunner 255 GPS Watch","Advanced running GPS watch with training metrics","349.99","399.99","Garmin","garmin,gps,running,watch","https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80"},
        };
        for (String[] s : sportsItems) {
            products.add(Product.builder()
                .sku(s[0]).name(s[1]).description(s[2])
                .price(Double.parseDouble(s[3])).originalPrice(Double.parseDouble(s[4]))
                .category(sports).brand(s[5])
                .images(s[7]).rating(4.2 + Math.random() * 0.6).reviewCount((int)(20 + Math.random() * 600))
                .inStock(true).stockQuantity((int)(3 + Math.random() * 30))
                .tags(s[6]).build());
        }

        // ── TOYS (20 products) ────────────────────────────────────────────────
        String[][] toyItems = {
            {"TOYS-LEG-1","LEGO Technic Bugatti Chiron (3599 pcs)","Ultimate LEGO Technic supercar build experience","449.99","499.99","LEGO","lego,technic,building,bugatti","https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80"},
            {"TOYS-LEG-2","LEGO City Police Station Set","Build a detailed city police station with 5 minifigures","199.99","229.99","LEGO","lego,city,police,building","https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80"},
            {"TOYS-LEG-3","LEGO Harry Potter Hogwarts Castle","Iconic Hogwarts castle with 6020 pieces","469.99","499.99","LEGO","lego,harry-potter,hogwarts,castle","https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80"},
            {"TOYS-ACT-1","Barbie Dreamhouse (75+ pieces)","3-story Barbie dream house with pool and slide","199.99","249.99","Barbie","barbie,dreamhouse,dolls,girls","https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=400&q=80"},
            {"TOYS-ACT-2","Hot Wheels Ultimate Garage (5-level)","Massive garage playset with loop and car wash","84.99","99.99","Hot Wheels","hot-wheels,cars,garage,boys","https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&q=80"},
            {"TOYS-ACT-3","Nerf Elite 2.0 Turbine CS-18 Blaster","Motorized blaster with 18-dart capacity","34.99","44.99","Nerf","nerf,blaster,outdoor,action","https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&q=80"},
            {"TOYS-EDU-1","Osmo - Genius Starter Kit for iPad","Award-winning educational tablet games for ages 6-10","89.99","109.99","Osmo","osmo,educational,ipad,learning","https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80"},
            {"TOYS-EDU-2","Snap Circuits Jr. SC-100 Electronics Kit","Build 100 electronics projects with snap-together parts","29.99","39.99","Snap Circuits","circuits,educational,stem,kids","https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80"},
            {"TOYS-BRD-1","Monopoly Classic Board Game","The classic real estate trading board game","24.99","29.99","Hasbro","monopoly,board-game,hasbro,family","https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&q=80"},
            {"TOYS-BRD-2","Catan Board Game (Base Game)","The world's best-selling strategy board game","44.99","54.99","Catan Studio","catan,board-game,strategy,family","https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&q=80"},
            {"TOYS-BRD-3","Jenga Classic Game","The original block-stacking, stack-crashing game","11.99","14.99","Hasbro","jenga,block,hasbro,family","https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&q=80"},
            {"TOYS-PLU-1","Melissa & Doug Giant Stuffed Panda","Incredibly soft and realistic stuffed animal panda","39.99","49.99","Melissa & Doug","stuffed,panda,plush,kids","https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=400&q=80"},
            {"TOYS-RC-1","Holy Stone HS720E GPS Drone 4K","GPS drone with 4K camera and 26-min flight time","219.99","279.99","Holy Stone","drone,rc,4k,camera","https://images.unsplash.com/photo-1508614999368-9260051292e5?w=400&q=80"},
            {"TOYS-RC-2","Traxxas Slash 4WD RC Short Course Truck","High-performance 4WD remote control truck","329.99","399.99","Traxxas","rc,truck,traxxas,remote-control","https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&q=80"},
        };
        for (String[] t : toyItems) {
            products.add(Product.builder()
                .sku(t[0]).name(t[1]).description(t[2])
                .price(Double.parseDouble(t[3])).originalPrice(Double.parseDouble(t[4]))
                .category(toys).brand(t[5])
                .images(t[7]).rating(4.4 + Math.random() * 0.5).reviewCount((int)(30 + Math.random() * 400))
                .inStock(true).stockQuantity((int)(5 + Math.random() * 40))
                .tags(t[6]).build());
        }

        // ── BEAUTY (20 products) ──────────────────────────────────────────────
        String[][] beautyItems = {
            {"BEAU-SKN-1","CeraVe Moisturizing Cream (16 oz)","Fragrance-free moisturizing cream with ceramides, dermatologist recommended","18.99","22.99","CeraVe","cerave,moisturizer,skincare,cream","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80"},
            {"BEAU-SKN-2","La Roche-Posay Anthelios SPF 60 Sunscreen","Lightweight sunscreen for sensitive skin, water resistant","29.99","34.99","La Roche-Posay","sunscreen,spf,skincare,sensitive","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80"},
            {"BEAU-SKN-3","TruSkin Vitamin C Serum","Anti-aging serum with Vitamin C, Hyaluronic Acid, and Vitamin E","19.99","24.99","TruSkin","vitamin-c,serum,anti-aging,skincare","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80"},
            {"BEAU-SKN-4","Neutrogena Hydro Boost Water Gel","Hyaluronic acid gel moisturizer for dry skin","24.99","29.99","Neutrogena","neutrogena,moisturizer,hyaluronic,skincare","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80"},
            {"BEAU-HAR-1","Dyson Airwrap Multi-Styler Complete","Complete hair styling tool with multiple attachments","599.99","649.99","Dyson","dyson,airwrap,hair,styling","https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"},
            {"BEAU-HAR-2","T3 Lucea ID Smart Flat Iron 1-inch","Professional flat iron with auto temperature adjustment","199.99","249.99","T3","flat-iron,hair,t3,styling","https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"},
            {"BEAU-HAR-3","OGX Argan Oil of Morocco Shampoo","Nourishing shampoo with pure Argan oil, paraben-free","9.99","11.99","OGX","shampoo,argan,ogx,haircare","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"BEAU-MKP-1","NARS Radiant Creamy Concealer","Full-coverage liquid concealer for a radiant finish","32.00","32.00","NARS","concealer,nars,makeup,coverage","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80"},
            {"BEAU-MKP-2","Charlotte Tilbury Pillow Talk Lipstick","Iconic nude-pink lipstick for all skin tones","34.00","34.00","Charlotte Tilbury","lipstick,charlotte-tilbury,makeup,lips","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80"},
            {"BEAU-MKP-3","Maybelline Fit Me Foundation","Lightweight liquid foundation for natural coverage","9.99","11.99","Maybelline","foundation,maybelline,makeup,coverage","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80"},
            {"BEAU-FRG-1","Chanel No. 5 Eau de Parfum (1.7 oz)","The legendary timeless fragrance for women","152.00","152.00","Chanel","chanel,perfume,fragrance,luxury","https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80"},
            {"BEAU-FRG-2","Dior Sauvage Eau de Toilette (3.4 oz)","Fresh and woody fragrance for men","149.00","149.00","Dior","dior,cologne,fragrance,men","https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80"},
            {"BEAU-NAL-1","OPI Nail Lacquer Set (12 colors)","Long-lasting nail polish in 12 iconic shades","59.99","74.99","OPI","nail-polish,opi,manicure,nails","https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80"},
        };
        for (String[] b : beautyItems) {
            products.add(Product.builder()
                .sku(b[0]).name(b[1]).description(b[2])
                .price(Double.parseDouble(b[3])).originalPrice(Double.parseDouble(b[4]))
                .category(beauty).brand(b[5])
                .images(b[7]).rating(4.3 + Math.random() * 0.5).reviewCount((int)(40 + Math.random() * 500))
                .inStock(true).stockQuantity((int)(10 + Math.random() * 80))
                .tags(b[6]).build());
        }

        // ── AUTO (15 products) ────────────────────────────────────────────────
        String[][] autoItems = {
            {"AUTO-ACC-1","Armor All Original Protectant (2-pack)","UV protection for car interior surfaces","12.99","15.99","Armor All","car,interior,protectant,auto","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-ACC-2","Chemical Guys HOL169 Car Wash Kit (16-piece)","Complete car detailing kit with wash, wax, and polish","79.99","99.99","Chemical Guys","car-wash,detailing,chemical-guys,auto","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-ACC-3","Garmin DriveSmart 66 GPS Navigator","6-inch GPS navigator with live traffic updates","199.99","249.99","Garmin","gps,navigator,garmin,car","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-ACC-4","Anker 63W Car Charger (USB-C & USB-A)","Fast charging car adapter with multiple ports","29.99","39.99","Anker","car-charger,anker,usb-c,charging","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-ACC-5","Thule Pulse Alpine Cargo Box","Aerodynamic rooftop cargo carrier, 16 cu ft","649.95","749.95","Thule","cargo,rooftop,thule,storage","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-TRE-1","Michelin Defender T+H (225/60R16, set of 4)","Long-lasting all-season touring tire, 80,000 mile warranty","599.99","699.99","Michelin","tires,michelin,all-season,auto","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-ELC-1","CTEK MXS 5.0 Battery Charger","Fully automatic 8-step battery charger and maintainer","89.99","109.99","CTEK","battery,charger,ctek,auto","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-ELC-2","Cobra RAD 480i Laser Radar Detector","Long-range radar and laser detector with IVT filter","149.95","199.95","Cobra","radar,detector,cobra,auto","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-FLR-1","WeatherTech FloorLiner (Front & Rear Set)","Custom-fit all-weather floor mats","189.95","224.95","WeatherTech","floor-mats,weathertech,car,auto","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
            {"AUTO-ELC-3","Nextbase 622GW Dash Cam 4K","4K dash camera with Alexa built-in and emergency SOS","329.99","399.99","Nextbase","dashcam,4k,nextbase,auto","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"},
        };
        for (String[] a : autoItems) {
            products.add(Product.builder()
                .sku(a[0]).name(a[1]).description(a[2])
                .price(Double.parseDouble(a[3])).originalPrice(Double.parseDouble(a[4]))
                .category(auto).brand(a[5])
                .images(a[7]).rating(4.1 + Math.random() * 0.7).reviewCount((int)(20 + Math.random() * 300))
                .inStock(true).stockQuantity((int)(5 + Math.random() * 30))
                .tags(a[6]).build());
        }

        productRepository.saveAll(products);
        log.info("Seeding complete: {} products across 8 categories.", products.size());
    }

    private Category cat(String name, String slug) {
        return categoryRepository.findAll().stream()
            .filter(c -> c.getSlug().equals(slug))
            .findFirst()
            .orElseGet(() -> categoryRepository.save(
                Category.builder().name(name).slug(slug).build()));
    }
}
