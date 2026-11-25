package com.dinokids.encyclopedia.ui.components

import android.graphics.BitmapFactory
import android.util.LruCache
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext

private object AssetBitmapCache {
    private val cache = LruCache<String, ImageBitmap>(16)

    fun getOrLoad(assetPath: String, loader: () -> ImageBitmap?): ImageBitmap? {
        cache.get(assetPath)?.let { return it }
        val loaded = loader() ?: return null
        cache.put(assetPath, loaded)
        return loaded
    }
}

@Composable
fun DinoAssetImage(
    assetPath: String,
    contentDescription: String,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
    placeholderColor: Color = Color(0xFFEAF2E3)
) {
    val context = LocalContext.current
    val bitmap = remember(assetPath) {
        AssetBitmapCache.getOrLoad(assetPath) {
            runCatching {
                context.assets.open(assetPath).use { stream ->
                    BitmapFactory.decodeStream(stream)?.asImageBitmap()
                }
            }.getOrNull()
        }
    }

    if (bitmap != null) {
        Image(
            bitmap = bitmap,
            contentDescription = contentDescription,
            modifier = modifier,
            contentScale = contentScale
        )
    } else {
        Box(modifier = modifier.background(placeholderColor))
    }
}
