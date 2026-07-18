// Copyright (C) by Ubaldo Porcheddu <ubaldo@eja.it>

package it.eja.logu

import android.app.Activity
import android.content.res.Configuration
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebView
import androidx.webkit.WebViewAssetLoader

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val nightModeFlags = resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
        if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
            setTheme(android.R.style.Theme_DeviceDefault_NoActionBar_Fullscreen)
        } else {
            setTheme(android.R.style.Theme_DeviceDefault_Light_NoActionBar_Fullscreen)
        }

        super.onCreate(savedInstanceState)
        window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        val webView = WebView(this)
        webView.settings.javaScriptEnabled = true

        webView.webViewClient = MyWebViewClient(assetLoader)
        webView.loadUrl("https://appassets.androidplatform.net/index.html")

        setContentView(webView)
    }
}

class MyWebViewClient(private val assetLoader: WebViewAssetLoader) : android.webkit.WebViewClient() {
    override fun shouldInterceptRequest(view: WebView, request: android.webkit.WebResourceRequest) =
        assetLoader.shouldInterceptRequest(request.url)
}