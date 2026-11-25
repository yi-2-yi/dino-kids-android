package com.dinokids.encyclopedia.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dinokids.encyclopedia.audio.DinoSpeaker
import com.dinokids.encyclopedia.model.Dinosaur
import com.dinokids.encyclopedia.ui.components.Dino3DWebView
import com.dinokids.encyclopedia.ui.theme.DeepForestText
import com.dinokids.encyclopedia.ui.theme.SoftOutline

@Composable
fun FullScreen3DScreen(
    dino: Dinosaur,
    speaker: DinoSpeaker,
    onClose: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .navigationBarsPadding()
    ) {
        Dino3DWebView(
            dinoId = dino.id,
            modifier = Modifier.fillMaxSize()
        )

        // Floating Header Overlay with Trilingual Quick Pronunciation
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = Color.White.copy(alpha = 0.9f),
                shadowElevation = 4.dp,
                border = BorderStroke(1.dp, SoftOutline)
            ) {
                Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)) {
                    Text(
                        text = dino.nameZh,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DeepForestText
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "🔊 中",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = dino.accentColor,
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { speaker.speakZh(dino.nameZh) }
                                .padding(horizontal = 4.dp, vertical = 2.dp)
                        )
                        Text(
                            text = "🇫🇷 ${dino.nameFr}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2B6CB0),
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { speaker.speakFr(dino.nameFr) }
                                .padding(horizontal = 4.dp, vertical = 2.dp)
                        )
                        Text(
                            text = "🇬🇧 ${dino.nameEn}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD95D2B),
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { speaker.speakEn(dino.nameEn) }
                                .padding(horizontal = 4.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Surface(
                shape = CircleShape,
                color = Color.White.copy(alpha = 0.92f),
                shadowElevation = 4.dp
            ) {
                IconButton(onClick = onClose) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = "退出全屏",
                        tint = DeepForestText
                    )
                }
            }
        }
    }
}
