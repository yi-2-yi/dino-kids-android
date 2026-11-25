package com.dinokids.encyclopedia.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.ChevronLeft
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.Fullscreen
import androidx.compose.material.icons.rounded.Image
import androidx.compose.material.icons.rounded.ViewInAr
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dinokids.encyclopedia.audio.DinoSpeaker
import com.dinokids.encyclopedia.model.Dinosaur
import com.dinokids.encyclopedia.ui.components.Dino3DWebView
import com.dinokids.encyclopedia.ui.components.DinoAssetImage
import com.dinokids.encyclopedia.ui.theme.CreamBackground
import com.dinokids.encyclopedia.ui.theme.DeepForestText
import com.dinokids.encyclopedia.ui.theme.MutedForestText
import com.dinokids.encyclopedia.ui.theme.SoftOutline
import com.dinokids.encyclopedia.ui.theme.SunnyOrange

@Composable
fun DetailScreen(
    dino: Dinosaur,
    currentIndex: Int,
    totalCount: Int,
    speaker: DinoSpeaker,
    onBack: () -> Unit,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    onOpenFullScreen3D: () -> Unit
) {
    var show3D by rememberSaveable { mutableStateOf(false) }
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CreamBackground)
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // Top Navigation Bar with Prev / Next Switchers
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Surface(
                shape = CircleShape,
                color = Color.White,
                shadowElevation = 2.dp,
                border = BorderStroke(1.dp, SoftOutline)
            ) {
                IconButton(onClick = {
                    speaker.stop()
                    onBack()
                }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                        contentDescription = "返回",
                        tint = DeepForestText
                    )
                }
            }

            // Segmented Switcher: Image vs 3D Model
            Surface(
                shape = RoundedCornerShape(999.dp),
                color = Color(0xFFEDE6D6),
                modifier = Modifier.padding(horizontal = 6.dp)
            ) {
                Row(modifier = Modifier.padding(4.dp)) {
                    ModeTabButton(
                        selected = !show3D,
                        icon = Icons.Rounded.Image,
                        label = "图鉴",
                        accent = dino.accentColor,
                        onClick = { show3D = false }
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    ModeTabButton(
                        selected = show3D,
                        icon = Icons.Rounded.ViewInAr,
                        label = "3D模型",
                        accent = dino.accentColor,
                        onClick = { show3D = true }
                    )
                }
            }

            // Prev / Next Dinosaur Buttons
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color.White,
                    shadowElevation = 2.dp,
                    border = BorderStroke(1.dp, SoftOutline)
                ) {
                    IconButton(
                        onClick = {
                            speaker.stop()
                            onPrevious()
                        },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.ChevronLeft,
                            contentDescription = "上一只",
                            tint = DeepForestText
                        )
                    }
                }
                Surface(
                    shape = CircleShape,
                    color = Color.White,
                    shadowElevation = 2.dp,
                    border = BorderStroke(1.dp, SoftOutline)
                ) {
                    IconButton(
                        onClick = {
                            speaker.stop()
                            onNext()
                        },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.ChevronRight,
                            contentDescription = "下一只",
                            tint = DeepForestText
                        )
                    }
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 6.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Hero Showcase Box (Illustration OR Interactive 3D Viewer)
            Card(
                shape = RoundedCornerShape(26.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 5.dp),
                border = BorderStroke(2.dp, dino.accentColor.copy(alpha = 0.25f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(310.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    if (show3D) {
                        Dino3DWebView(
                            dinoId = dino.id,
                            modifier = Modifier.fillMaxSize()
                        )

                        // Fullscreen 3D button
                        Surface(
                            shape = RoundedCornerShape(999.dp),
                            color = Color.White.copy(alpha = 0.9f),
                            shadowElevation = 3.dp,
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(12.dp)
                                .clip(RoundedCornerShape(999.dp))
                                .clickable { onOpenFullScreen3D() }
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.Fullscreen,
                                    contentDescription = "全屏3D",
                                    tint = DeepForestText,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "全屏",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = DeepForestText
                                )
                            }
                        }
                    } else {
                        DinoAssetImage(
                            assetPath = dino.imageAssetPath,
                            contentDescription = dino.nameZh,
                            contentScale = ContentScale.Crop,
                            placeholderColor = dino.softBgColor,
                            modifier = Modifier
                                .fillMaxSize()
                                .clickable { speaker.speakZh(dino.nameZh) }
                        )

                        // Page indicator badge
                        Surface(
                            shape = RoundedCornerShape(999.dp),
                            color = Color.Black.copy(alpha = 0.45f),
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .padding(12.dp)
                        ) {
                            Text(
                                text = "${currentIndex + 1} / $totalCount",
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }

                        // Quick CTA to jump into 3D mode!
                        Button(
                            onClick = { show3D = true },
                            colors = ButtonDefaults.buttonColors(containerColor = SunnyOrange),
                            shape = RoundedCornerShape(999.dp),
                            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp),
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.ViewInAr,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "看 3D 模型",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }
                }
            }

            // Trilingual Names Section (Chinese, French, English) with Tap-to-Speak!
            Card(
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, SoftOutline),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Chinese Hero Name Row
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = dino.softBgColor,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .clickable { speaker.speakZh(dino.nameZh) }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "🇨🇳 中文名字 · ${dino.pinyin}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = dino.accentColor
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = dino.nameZh,
                                    fontSize = 30.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = DeepForestText
                                )
                            }
                            Surface(
                                shape = CircleShape,
                                color = dino.accentColor,
                                modifier = Modifier.size(44.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Rounded.VolumeUp,
                                        contentDescription = "朗读中文名字",
                                        tint = Color.White,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                            }
                        }
                    }

                    // French & English Side-by-Side Tappable Cards
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        LanguageNameChip(
                            flagAndLang = "🇫🇷 法语 · Français",
                            name = dino.nameFr,
                            bgColor = Color(0xFFEEF4FF),
                            accentColor = Color(0xFF2B6CB0),
                            onClick = { speaker.speakFr(dino.nameFr) },
                            modifier = Modifier.weight(1f)
                        )
                        LanguageNameChip(
                            flagAndLang = "🇬🇧 英语 · English",
                            name = dino.nameEn,
                            bgColor = Color(0xFFFFF3EC),
                            accentColor = Color(0xFFD95D2B),
                            onClick = { speaker.speakEn(dino.nameEn) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Quick Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatPillCard(
                    emoji = "⏳",
                    title = "生活时代",
                    value = dino.eraLabel,
                    modifier = Modifier.weight(1f)
                )
                StatPillCard(
                    emoji = dino.dietEmoji,
                    title = "爱吃什么",
                    value = dino.dietLabel,
                    modifier = Modifier.weight(1f)
                )
                StatPillCard(
                    emoji = "📏",
                    title = "身体大小",
                    value = dino.lengthLabel,
                    modifier = Modifier.weight(1f)
                )
            }

            // Kid-Friendly Size Comparison Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFFFFF6D6),
                border = BorderStroke(1.dp, Color(0xFFF3DA8C)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "📐", fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "有多大呢？${dino.sizeCompareZh}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF6B4C00)
                    )
                }
            }

            // Chinese Introduction Card with Read-Aloud Button
            Card(
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, SoftOutline),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "📖 恐龙小简介",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = DeepForestText
                        )

                        Button(
                            onClick = {
                                speaker.speakZh("${dino.nameZh}。${dino.descriptionZh}你知道吗？${dino.funFactZh}")
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = dino.accentColor),
                            shape = RoundedCornerShape(999.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Rounded.VolumeUp,
                                contentDescription = "读给我听",
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = "读给我听",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Text(
                        text = dino.descriptionZh,
                        fontSize = 16.sp,
                        lineHeight = 27.sp,
                        color = DeepForestText
                    )

                    // Fun Fact Callout
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = dino.softBgColor,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "💡 你知道吗？",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = dino.accentColor
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = dino.funFactZh,
                                fontSize = 15.sp,
                                lineHeight = 23.sp,
                                color = DeepForestText
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun ModeTabButton(
    selected: Boolean,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    accent: Color,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(999.dp),
        color = if (selected) accent else Color.Transparent,
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .clickable(onClick = onClick)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (selected) Color.White else DeepForestText,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = label,
                fontSize = 13.sp,
                fontWeight = FontWeight.ExtraBold,
                color = if (selected) Color.White else DeepForestText
            )
        }
    }
}

@Composable
private fun LanguageNameChip(
    flagAndLang: String,
    name: String,
    bgColor: Color,
    accentColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = bgColor,
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = flagAndLang,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = accentColor,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = Icons.AutoMirrored.Rounded.VolumeUp,
                    contentDescription = "发音",
                    tint = accentColor,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(5.dp))
            Text(
                text = name,
                fontSize = 16.sp,
                fontWeight = FontWeight.ExtraBold,
                color = DeepForestText,
                maxLines = 2,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
private fun StatPillCard(
    emoji: String,
    title: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Color.White,
        border = BorderStroke(1.dp, SoftOutline),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = emoji, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = title,
                fontSize = 11.sp,
                color = MutedForestText,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = value,
                fontSize = 13.sp,
                fontWeight = FontWeight.ExtraBold,
                color = DeepForestText,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
