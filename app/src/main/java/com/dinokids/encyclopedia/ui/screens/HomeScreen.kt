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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Casino
import androidx.compose.material.icons.rounded.ViewInAr
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dinokids.encyclopedia.model.DinoCategory
import com.dinokids.encyclopedia.model.Dinosaur
import com.dinokids.encyclopedia.ui.components.DinoAssetImage
import com.dinokids.encyclopedia.ui.theme.CreamBackground
import com.dinokids.encyclopedia.ui.theme.DeepForestText
import com.dinokids.encyclopedia.ui.theme.JungleGreen
import com.dinokids.encyclopedia.ui.theme.MutedForestText
import com.dinokids.encyclopedia.ui.theme.SoftOutline
import com.dinokids.encyclopedia.ui.theme.SunnyOrange

@Composable
fun HomeScreen(
    dinosaurs: List<Dinosaur>,
    onSelectDino: (Dinosaur) -> Unit,
    onRandomDino: () -> Unit
) {
    var selectedCategory by remember { mutableStateOf(DinoCategory.ALL) }

    val filteredDinosaurs = remember(dinosaurs, selectedCategory) {
        if (selectedCategory == DinoCategory.ALL) {
            dinosaurs
        } else {
            dinosaurs.filter { it.category == selectedCategory }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CreamBackground)
            .statusBarsPadding()
    ) {
        // Cheerful Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 18.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "🦕 恐龙乐园",
                    style = MaterialTheme.typography.headlineLarge,
                    color = DeepForestText
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "看图鉴 · 玩 3D 模型 · 听中法英名字",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MutedForestText
                )
            }

            Button(
                onClick = onRandomDino,
                colors = ButtonDefaults.buttonColors(containerColor = SunnyOrange),
                shape = RoundedCornerShape(999.dp),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 10.dp),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 3.dp)
            ) {
                Icon(
                    imageVector = Icons.Rounded.Casino,
                    contentDescription = "随机恐龙",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(5.dp))
                Text(
                    text = "随机看",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Category Filter Chips
        LazyRow(
            contentPadding = PaddingValues(horizontal = 18.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.padding(bottom = 12.dp)
        ) {
            items(DinoCategory.entries) { category ->
                val selected = category == selectedCategory
                Surface(
                    shape = RoundedCornerShape(999.dp),
                    color = if (selected) JungleGreen else Color.White,
                    border = if (selected) null else BorderStroke(1.dp, SoftOutline),
                    shadowElevation = if (selected) 3.dp else 0.dp,
                    modifier = Modifier
                        .clip(RoundedCornerShape(999.dp))
                        .clickable { selectedCategory = category }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 9.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = category.emoji, fontSize = 15.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = category.labelZh,
                            color = if (selected) Color.White else DeepForestText,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // 2-Column Kid-Friendly Dinosaur Grid
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 165.dp),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 28.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredDinosaurs, key = { it.id }) { dino ->
                DinoGridCard(dino = dino, onClick = { onSelectDino(dino) })
            }
        }
    }
}

@Composable
private fun DinoGridCard(
    dino: Dinosaur,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        border = BorderStroke(1.dp, SoftOutline),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(4f / 3f)
                    .clip(RoundedCornerShape(topStart = 22.dp, topEnd = 22.dp))
            ) {
                DinoAssetImage(
                    assetPath = dino.imageAssetPath,
                    contentDescription = dino.nameZh,
                    contentScale = ContentScale.Crop,
                    placeholderColor = dino.softBgColor,
                    modifier = Modifier.fillMaxSize()
                )

                // Subtle bottom scrim for visual polish
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(32.dp)
                        .align(Alignment.BottomCenter)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.22f))
                            )
                        )
                )

                // Diet badge (Top-Left)
                Surface(
                    shape = RoundedCornerShape(999.dp),
                    color = Color.White.copy(alpha = 0.92f),
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp)
                ) {
                    Text(
                        text = "${dino.dietEmoji} ${dino.dietLabel}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = DeepForestText,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                // 3D indicator badge (Top-Right)
                Surface(
                    shape = CircleShape,
                    color = dino.accentColor.copy(alpha = 0.94f),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 7.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.ViewInAr,
                            contentDescription = "3D模型",
                            tint = Color.White,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "3D",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(dino.softBgColor.copy(alpha = 0.45f))
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = dino.nameZh,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DeepForestText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = dino.eraLabel.take(3),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = dino.accentColor
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "🇫🇷 ${dino.nameFr}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MutedForestText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "🇬🇧 ${dino.nameEn}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = MutedForestText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}
