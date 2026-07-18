plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "it.eja.logu"
    compileSdk = 34

    defaultConfig {
        applicationId = "it.eja.logu"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "0.7.18"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

tasks.register<Copy>("copyWebFiles") {
    from("${projectDir}/../../")
    include("index.html", "style.css", "script.js", "marked.js","README.md")
    into("${projectDir}/src/main/assets")
}

tasks.named("preBuild") {
    dependsOn("copyWebFiles")
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}