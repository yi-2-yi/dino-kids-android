package com.dinokids.encyclopedia.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val CreamBackground = Color(0xFFFFFBF2)
val WarmCardSurface = Color(0xFFFFFFFF)
val JungleGreen = Color(0xFF2F8F5B)
val SunnyOrange = Color(0xFFFF7D2D)
val DeepForestText = Color(0xFF1F3328)
val MutedForestText = Color(0xFF566B5E)
val SoftOutline = Color(0xFFE7DFCE)

private val DinoColorScheme = lightColorScheme(
    primary = JungleGreen,
    onPrimary = Color.White,
    secondary = SunnyOrange,
    onSecondary = Color.White,
    background = CreamBackground,
    onBackground = DeepForestText,
    surface = WarmCardSurface,
    onSurface = DeepForestText,
    surfaceVariant = Color(0xFFF5EFE2),
    onSurfaceVariant = MutedForestText,
    outline = SoftOutline
)

private val DinoTypography = Typography(
    headlineLarge = TextStyle(
        fontSize = 28.sp,
        fontWeight = FontWeight.ExtraBold,
        lineHeight = 34.sp,
        color = DeepForestText
    ),
    headlineMedium = TextStyle(
        fontSize = 22.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 28.sp,
        color = DeepForestText
    ),
    titleLarge = TextStyle(
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 26.sp,
        color = DeepForestText
    ),
    titleMedium = TextStyle(
        fontSize = 16.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 22.sp,
        color = DeepForestText
    ),
    bodyLarge = TextStyle(
        fontSize = 16.sp,
        fontWeight = FontWeight.Normal,
        lineHeight = 25.sp,
        color = DeepForestText
    ),
    bodyMedium = TextStyle(
        fontSize = 14.sp,
        fontWeight = FontWeight.Normal,
        lineHeight = 21.sp,
        color = MutedForestText
    ),
    labelLarge = TextStyle(
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        lineHeight = 18.sp
    )
)

@Composable
fun DinoKidsTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DinoColorScheme,
        typography = DinoTypography,
        content = content
    )
}
